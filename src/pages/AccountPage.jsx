import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Tag,
  Bell,
  Settings,
  LogOut,
  Edit2,
  Trash2,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Camera,
  Mail,
  Phone,
  Calendar,
  Globe,
  Lock,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  FileText,
  Building,
  Home,
  Star,
  Check,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShiprocketTrackerModal } from '../components/common/ShiprocketTrackerModal.jsx';
import { OrderMilestoneTracker } from '../components/common/OrderMilestoneTracker.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { getProductUrl } from '../utils/productUrl.js';
import { downloadOrderInvoicePdf } from '../utils/invoicePdf.js';
import { api } from '../services/api.js';

export function AccountPage() {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    saveAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    isAdmin
  } = useAuth();

  const { wishlist, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart, applyCoupon } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'profile';

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedWaybill, setSelectedWaybill] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [activeOrderMenu, setActiveOrderMenu] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const toggleOrderMilestones = (orderId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [orderId]: prev[orderId] === false ? true : false
    }));
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Arijit Singh',
    email: user?.email || 'arijit.singh@example.com',
    phone: user?.phone || '9876543210',
    country_code: '+91',
    dob: user?.dob || '2004-10-15',
    gender: user?.gender || 'male',
    preferred_language: user?.preferred_language || 'English'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    is_default: false
  });

  // Payment Methods State (Persisted in localStorage + default seed)
  const [savedPayments, setSavedPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('oct9_saved_payments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'pm_1',
        type: 'visa',
        brand: 'Visa',
        numberMasked: '**** 4321',
        expiry: '12/2028',
        nameOnCard: user?.name || 'Arijit Singh',
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'mastercard',
        brand: 'Mastercard',
        numberMasked: '**** 9876',
        expiry: '08/2027',
        nameOnCard: user?.name || 'Arijit Singh',
        isDefault: false
      },
      {
        id: 'pm_3',
        type: 'upi',
        brand: 'UPI ID',
        upiId: (user?.email ? user.email.split('@')[0] : 'arijit.singh') + '@okaxis',
        nameOnCard: user?.name || 'Arijit Singh',
        isDefault: false
      }
    ];
  });

  const [paymentMethodType, setPaymentMethodType] = useState('card');
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: user?.name || 'Arijit Singh',
    isDefault: false
  });
  const [newUpi, setNewUpi] = useState({
    upiId: '',
    isDefault: false
  });
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState('');

  // Wishlist Tab Filter & Sort
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [wishlistSort, setWishlistSort] = useState('newest');

  // Coupon Copy Feedback & Tab States
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [couponTab, setCouponTab] = useState('available');
  const [customCouponInput, setCustomCouponInput] = useState('');
  const [couponApplyFeedback, setCouponApplyFeedback] = useState('');
  const [expandedCouponId, setExpandedCouponId] = useState(null);

  // Notification Tab States
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'notif_1',
      category: 'orders',
      title: 'Your order #OCT9123456 has been delivered',
      badge: 'Delivered',
      desc: 'Your order for Georgette Party Wear Saree has been successfully delivered.',
      time: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      unread: true
    },
    {
      id: 'notif_2',
      category: 'offers',
      title: 'Flat 10% Off on All Sarees',
      badge: 'Special Offer',
      desc: 'Use code SAREE10 and get flat 10% off on all sarees. Minimum order value ₹1,999.',
      time: '5 hours ago',
      iconType: 'gift',
      iconBg: 'bg-[#FDF2F4]',
      unread: true
    },
    {
      id: 'notif_3',
      category: 'orders',
      title: 'Your order #OCT9123401 has been shipped',
      badge: 'Shipped',
      desc: 'Your order for Embroidered Punjabi Jutti has been shipped and is on the way.',
      time: '1 day ago',
      iconType: 'truck',
      iconBg: 'bg-[#EBF7FC]',
      unread: true
    },
    {
      id: 'notif_4',
      category: 'offers',
      title: 'An item in your wishlist is now at a lower price',
      desc: 'Banarasi Party Wear Saree is now at ₹3,499 (36% OFF).',
      time: '2 days ago',
      iconType: 'heart',
      iconBg: 'bg-[#FDF2F4]',
      actionButton: { label: 'View Product', link: '/category/sarees' },
      unread: true
    },
    {
      id: 'notif_5',
      category: 'offers',
      title: 'The Big Festive Sale Is Live!',
      badge: 'Limited Time',
      desc: 'Get up to 50% off on selected items. Shop your festive favourites now.',
      time: '3 days ago',
      iconType: 'percent',
      iconBg: 'bg-[#F3EFFC]',
      actionButton: { label: 'Shop Now', link: '/new-arrivals' },
      unread: true
    },
    {
      id: 'notif_6',
      category: 'orders',
      title: 'Review your recent purchase',
      desc: 'Share your feedback for Georgette Party Wear Saree and help others shop better.',
      time: '4 days ago',
      iconType: 'star',
      iconBg: 'bg-[#FFF9E6]',
      actionButton: { label: 'Write a Review', link: '/account?tab=orders' },
      unread: false
    },
    {
      id: 'notif_7',
      category: 'account',
      title: 'Account security alert',
      desc: 'A new login to your account was detected from Chrome on Windows.',
      time: '5 days ago',
      iconType: 'shield',
      iconBg: 'bg-[#EBF7FC]',
      unread: false
    },
    {
      id: 'notif_8',
      category: 'updates',
      title: 'Profile updated successfully',
      desc: 'Your profile information has been updated.',
      time: '1 week ago',
      iconType: 'settings',
      iconBg: 'bg-[#F1F5F9]',
      unread: false
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone ? user.phone.replace('+91', '').trim() : prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('oct9_saved_payments', JSON.stringify(savedPayments));
  }, [savedPayments]);

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getUserOrders();
      if (res.success && res.orders && res.orders.length > 0) {
        setOrders(res.orders);
      } else {
        // High quality seed orders matching screenshots if server returns empty
        setOrders(getInitialSampleOrders(user));
      }
    } catch (e) {
      console.warn('Using seeded orders for showcase:', e.message);
      setOrders(getInitialSampleOrders(user));
    } finally {
      setLoadingOrders(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profileForm.name,
        phone: `${profileForm.country_code} ${profileForm.phone}`,
        dob: profileForm.dob,
        gender: profileForm.gender,
        preferred_language: profileForm.preferred_language
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
      setIsEditingProfile(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  // Address Save
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: user?.name || 'Arijit Singh',
      phone: user?.phone || '9876543210',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'Home',
      is_default: (user?.addresses || []).length === 0
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      type: addr.type || 'Home',
      is_default: Boolean(addr.is_default)
    });
    setShowAddressModal(true);
  };

  const handleSaveAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await saveAddress(addressForm);
      }
      setShowAddressModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      await setDefaultAddress(addrId);
    } catch (err) {
      alert('Could not update default address: ' + err.message);
    }
  };

  // Payment Methods Handlers
  const handleSaveNewCard = (e) => {
    e.preventDefault();
    if (!newCard.number || !newCard.expiry) return;

    const last4 = newCard.number.replace(/\s+/g, '').slice(-4) || '1234';
    const isVisa = newCard.number.startsWith('4');
    const brand = isVisa ? 'Visa' : 'Mastercard';

    const newEntry = {
      id: 'pm_' + Date.now(),
      type: isVisa ? 'visa' : 'mastercard',
      brand: brand,
      numberMasked: `**** ${last4}`,
      expiry: newCard.expiry,
      nameOnCard: newCard.name,
      isDefault: newCard.isDefault
    };

    setSavedPayments(prev => {
      let updated = prev;
      if (newCard.isDefault) {
        updated = updated.map(p => ({ ...p, isDefault: false }));
      }
      return [newEntry, ...updated];
    });

    setPaymentSaveSuccess('Card saved successfully!');
    setTimeout(() => setPaymentSaveSuccess(''), 3000);
    setNewCard({ number: '', expiry: '', cvv: '', name: user?.name || 'Arijit Singh', isDefault: false });
  };

  const handleSaveNewUpi = (e) => {
    e.preventDefault();
    if (!newUpi.upiId) return;

    const newEntry = {
      id: 'pm_' + Date.now(),
      type: 'upi',
      brand: 'UPI ID',
      upiId: newUpi.upiId,
      nameOnCard: user?.name || 'Arijit Singh',
      isDefault: newUpi.isDefault
    };

    setSavedPayments(prev => {
      let updated = prev;
      if (newUpi.isDefault) {
        updated = updated.map(p => ({ ...p, isDefault: false }));
      }
      return [newEntry, ...updated];
    });

    setPaymentSaveSuccess('UPI ID saved successfully!');
    setTimeout(() => setPaymentSaveSuccess(''), 3000);
    setNewUpi({ upiId: '', isDefault: false });
  };

  const handleSetDefaultPayment = (id) => {
    setSavedPayments(prev =>
      prev.map(p => ({
        ...p,
        isDefault: p.id === id
      }))
    );
  };

  const handleDeletePayment = (id) => {
    setSavedPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2500);
  };

  // Sample Wishlist items for rich showcase if user wishlist is empty
  const displayWishlist = useMemo(() => {
    let items = wishlist.length > 0 ? wishlist : getSampleWishlist();
    if (wishlistSearch.trim()) {
      items = items.filter(it => it.title.toLowerCase().includes(wishlistSearch.toLowerCase()));
    }
    if (wishlistSort === 'price-low') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (wishlistSort === 'price-high') {
      items = [...items].sort((a, b) => b.price - a.price);
    }
    return items;
  }, [wishlist, wishlistSearch, wishlistSort]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        !orderSearch.trim() ||
        o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.items && o.items.some(it => it.product_title.toLowerCase().includes(orderSearch.toLowerCase())));

      if (!matchSearch) return false;
      if (orderStatusFilter === 'all') return true;
      if (orderStatusFilter === 'processing') return o.order_status === 'processing' || o.order_status === 'confirmed';
      if (orderStatusFilter === 'shipped') return o.order_status === 'shipped' || (o.shiprocket_status || o.delhivery_status) === 'in_transit' || (o.shiprocket_status || o.delhivery_status) === 'manifested';
      if (orderStatusFilter === 'delivered') return o.order_status === 'delivered';
      if (orderStatusFilter === 'cancelled') return o.order_status === 'cancelled';
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Compute Order Count Badges
  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      processing: orders.filter(o => o.order_status === 'processing' || o.order_status === 'confirmed').length,
      shipped: orders.filter(o => o.order_status === 'shipped' || (o.shiprocket_status || o.delhivery_status) === 'in_transit' || (o.shiprocket_status || o.delhivery_status) === 'manifested').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
      cancelled: orders.filter(o => o.order_status === 'cancelled').length
    };
  }, [orders]);

  // Current Addresses (from user or sample)
  const currentAddresses = useMemo(() => {
    if (user?.addresses && user.addresses.length > 0) {
      return user.addresses;
    }
    return [
      {
        id: 1,
        name: user?.name || 'Arijit Singh',
        phone: user?.phone || '+91 98765 43210',
        address_line1: 'A-12, Subhash Park Extension',
        address_line2: 'Shahdara',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110032',
        type: 'Home',
        is_default: 1
      },
      {
        id: 2,
        name: user?.name || 'Arijit Singh',
        phone: user?.phone || '+91 98765 43210',
        address_line1: 'Plot No. 8, Sector 62',
        address_line2: '',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        type: 'Office',
        is_default: 0
      },
      {
        id: 3,
        name: user?.name || 'Arijit Singh',
        phone: user?.phone || '+91 98765 43210',
        address_line1: 'House No. 45, Green Park',
        address_line2: '',
        city: 'Agra',
        state: 'Uttar Pradesh',
        pincode: '282001',
        type: 'Other',
        is_default: 0
      }
    ];
  }, [user]);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AS';

  const tabTitleMap = {
    profile: 'My Profile',
    orders: 'My Orders',
    wishlist: 'Wishlist',
    addresses: 'Addresses',
    payment: 'Payment Methods',
    offers: 'Offers & Coupons',
    notifications: 'Notifications',
    settings: 'Settings'
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10 text-neutral-900 font-sans">
      <SEO title={`${tabTitleMap[activeTab] || 'My Account'} | OCT9 Luxury Ethnic Wear`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-brand-maroon transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link
            to="/account?tab=profile"
            className="hover:text-brand-maroon transition-colors"
          >
            My Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900">
            {tabTitleMap[activeTab] || 'My Profile'}
          </span>
        </nav>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Sidebar User Header Pill */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-[#F5EBE1] text-[#2A2A2A] font-serif font-bold text-base flex items-center justify-center border border-[#E8DCCF] shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-neutral-900 truncate">
                    {user.name || 'Arijit Singh'}
                  </h3>
                  <button
                    onClick={() => setSearchParams({ tab: 'profile' })}
                    className="text-[11px] font-semibold text-brand-maroon hover:underline flex items-center space-x-0.5 cursor-pointer mt-0.5"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 space-y-1">
                {/* Nav Item: My Profile */}
                <button
                  onClick={() => setSearchParams({ tab: 'profile' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </div>
                </button>

                {/* Nav Item: My Orders */}
                <button
                  onClick={() => setSearchParams({ tab: 'orders' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </div>
                </button>

                {/* Nav Item: Wishlist */}
                <button
                  onClick={() => setSearchParams({ tab: 'wishlist' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'wishlist'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'wishlist'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FDF2F4] text-[#5A1827]'
                    }`}
                  >
                    {wishlistCount > 0 ? wishlistCount : 3}
                  </span>
                </button>

                {/* Nav Item: Addresses */}
                <button
                  onClick={() => setSearchParams({ tab: 'addresses' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'addresses'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4" />
                    <span>Addresses</span>
                  </div>
                </button>

                {/* Nav Item: Payment Methods */}
                <button
                  onClick={() => setSearchParams({ tab: 'payment' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'payment'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Methods</span>
                  </div>
                </button>

                {/* Nav Item: Offers & Coupons */}
                <button
                  onClick={() => setSearchParams({ tab: 'offers' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'offers'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Tag className="w-4 h-4" />
                    <span>Offers & Coupons</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'offers'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    2
                  </span>
                </button>

                {/* Nav Item: Notifications */}
                <button
                  onClick={() => setSearchParams({ tab: 'notifications' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </div>
                </button>

                {/* Nav Item: Settings */}
                <button
                  onClick={() => setSearchParams({ tab: 'settings' })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#5A1827] text-white shadow-2xs font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </div>
                </button>

                {/* Admin Link if role is admin */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-gold bg-[#1E1E1E] hover:bg-black transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-gold" />
                    <span>Admin Control Center</span>
                  </Link>
                )}

                {/* Nav Item: Logout */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-6">
            {/* ========================================================= */}
            {/* TAB 1: MY PROFILE */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    My Profile
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage your personal information.
                  </p>
                </div>

                {/* Card 1: User Overview Card with Avatar */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-5">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5EBE1] text-[#2A2A2A] font-serif font-bold text-2xl flex items-center justify-center border-2 border-[#E8DCCF]">
                        {initials}
                      </div>
                      <button
                        className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#2A2A2A] hover:bg-[#111] text-white flex items-center justify-center border-2 border-white shadow cursor-pointer transition-colors"
                        title="Upload Photo"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                        {user.name || 'Arijit Singh'}
                      </h2>
                      <p className="text-xs text-neutral-500">{user.email || 'arijit.singh@example.com'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>+91 {profileForm.phone}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>15 Oct 2004</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                </div>

                {/* Card 2: Personal Information Form */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
                  {/* Section Title */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDF2F4] text-[#5A1827] flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#5A1827]">
                        Personal Information
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Keep your information up to date for a better shopping experience.
                      </p>
                    </div>
                  </div>

                  {profileSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Profile details updated successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon focus:bg-white text-neutral-900 font-semibold"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon focus:bg-white text-neutral-900 font-semibold"
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      </div>

                      {/* Mobile Number with Country Code Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Mobile Number *
                        </label>
                        <div className="flex space-x-2">
                          <select
                            value={profileForm.country_code}
                            onChange={(e) => setProfileForm({ ...profileForm, country_code: e.target.value })}
                            className="w-20 text-xs px-2 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+971">+971</option>
                          </select>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="flex-1 text-xs px-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon focus:bg-white font-semibold text-neutral-900"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Date of Birth *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={profileForm.dob}
                            onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                            className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon focus:bg-white font-semibold text-neutral-900"
                          />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      </div>

                      {/* Gender Radio Group */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-2">
                          Gender *
                        </label>
                        <div className="flex items-center space-x-5 text-xs text-neutral-800 pt-1">
                          {['male', 'female', 'other'].map((g) => (
                            <label
                              key={g}
                              className="inline-flex items-center space-x-2 cursor-pointer font-semibold capitalize"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={profileForm.gender === g}
                                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                className="accent-[#5A1827] w-4 h-4 cursor-pointer"
                              />
                              <span>{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Language */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Preferred Language *
                        </label>
                        <div className="relative">
                          <select
                            value={profileForm.preferred_language}
                            onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                            className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi (हिंदी)</option>
                            <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                            <option value="Bengali">Bengali (বাংলা)</option>
                            <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                          </select>
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: MY ORDERS */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    My Orders
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Track, manage and view all your orders.
                  </p>
                </div>

                {/* Search and Filter Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by Order ID, Product or Date..."
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-neutral-200/90 rounded-xl focus:outline-none focus:border-brand-maroon shadow-2xs font-semibold text-neutral-900"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  </div>

                  <button
                    onClick={() => setOrderStatusFilter(orderStatusFilter === 'all' ? 'shipped' : 'all')}
                    className="px-4 py-2.5 bg-white border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs flex items-center space-x-1.5 shrink-0 self-stretch sm:self-auto cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Filter</span>
                  </button>
                </div>

                {/* Status Tabs Bar */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-neutral-200/80 no-scrollbar text-xs font-bold">
                  {[
                    { key: 'all', label: `All Orders (${orderCounts.all})` },
                    { key: 'processing', label: `Processing (${orderCounts.processing})` },
                    { key: 'shipped', label: `Shipped (${orderCounts.shipped})` },
                    { key: 'delivered', label: `Delivered (${orderCounts.delivered})` },
                    { key: 'cancelled', label: `Cancelled (${orderCounts.cancelled})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderStatusFilter(tab.key)}
                      className={`pb-2.5 px-3 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                        orderStatusFilter === tab.key
                          ? 'border-[#5A1827] text-[#5A1827]'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80 shadow-2xs space-y-3">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto" />
                    <h3 className="font-serif font-bold text-base text-neutral-800">
                      No matching orders found
                    </h3>
                    <p className="text-xs text-neutral-500">
                      You haven't placed any orders in this status category yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((o) => {
                      const firstItem = (o.items && o.items[0]) || {
                        product_title: 'Georgette Party Wear Saree',
                        quantity: 1,
                        size: 'Free Size',
                        price: o.grand_total,
                        product_image: '/oct9-logo.jpg'
                      };

                      const isDelivered = o.order_status === 'delivered';
                      const isShipped = o.order_status === 'shipped' || (o.shiprocket_status || o.delhivery_status) === 'in_transit' || (o.shiprocket_status || o.delhivery_status) === 'manifested';
                      const isProcessing = o.order_status === 'processing' || o.order_status === 'confirmed';
                      const isCancelled = o.order_status === 'cancelled';

                      return (
                        <div
                          key={o.id}
                          className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
                        >
                          {/* Top Row: Thumbnail + Order ID + Status + Amount + Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                              {/* Order Image Thumbnail */}
                              <div className="w-16 h-18 sm:w-20 sm:h-22 rounded-xl bg-[#9B4553] text-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {firstItem.product_image && firstItem.product_image.startsWith('http') ? (
                                  <img
                                    src={firstItem.product_image}
                                    alt={firstItem.product_title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="p-2 text-center">
                                    <span className="text-[10px] font-bold leading-tight block">
                                      {firstItem.product_title.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Order Info */}
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900">
                                    Order #{o.order_number}
                                  </span>
                                  {isDelivered && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      ● Delivered
                                    </span>
                                  )}
                                  {isShipped && !isDelivered && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      ● Shipped
                                    </span>
                                  )}
                                  {isProcessing && !isShipped && !isDelivered && !isCancelled && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                      ● Processing
                                    </span>
                                  )}
                                  {isCancelled && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                      ● Cancelled
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-neutral-400">
                                  {new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>

                                {/* Item Description line */}
                                <div className="pt-1 flex items-center space-x-2 text-xs">
                                  <span className="font-bold text-neutral-900">
                                    {firstItem.product_title}
                                  </span>
                                  <span className="text-neutral-400">|</span>
                                  <span className="text-neutral-500 text-[11px]">
                                    Qty: {firstItem.quantity || 1} • Size: {firstItem.size || 'Free Size'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side: Amount & View Details */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                              <div className="sm:text-right">
                                <p className="font-bold text-neutral-900 text-sm sm:text-base">
                                  ₹{Number(o.grand_total).toLocaleString('en-IN')}
                                </p>
                                <span className="text-[10px] text-neutral-500 block">
                                  {isCancelled
                                    ? 'Refund Initiated'
                                    : o.payment_method === 'cod'
                                    ? 'Paid via COD'
                                    : 'Paid via Card / UPI'}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/order-success/${o.order_number}`}
                                  className="px-3.5 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  View Details
                                </Link>

                                <button
                                  onClick={async () => {
                                    setDownloadingInvoiceId(o.id);
                                    await downloadOrderInvoicePdf(o);
                                    setDownloadingInvoiceId(null);
                                  }}
                                  disabled={downloadingInvoiceId === o.id}
                                  title="Download Tax Invoice PDF"
                                  className="p-1.5 border border-neutral-300 hover:bg-neutral-50 text-brand-maroon rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Stepped Tracker (For active / completed orders) */}
                          {!isCancelled && (
                            <div className="pt-3 border-t border-neutral-100 space-y-3">
                              {/* 5-Step Visual Tracker Bar with Milestone Locations & Timestamps */}
                              <OrderMilestoneTracker order={o} />

                              {/* Logistics Footer with Live GPS Tracking Button */}
                              {(o.shiprocket_awb || o.delhivery_waybill) && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-neutral-100">
                                  <span className="text-neutral-500 font-mono text-[11px]">
                                    Shiprocket AWB: <strong className="text-neutral-900">{o.shiprocket_awb || o.delhivery_waybill}</strong>
                                  </span>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => setSelectedWaybill(o.shiprocket_awb || o.delhivery_waybill)}
                                      className="text-brand-maroon font-bold text-xs hover:underline flex items-center space-x-1 cursor-pointer"
                                    >
                                      <Truck className="w-3.5 h-3.5" />
                                      <span>Track Live GPS</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: WISHLIST */}
            {/* ========================================================= */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    My Wishlist
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Save your favourite products for later.
                  </p>
                </div>

                {/* Search & Sort Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={wishlistSearch}
                      onChange={(e) => setWishlistSearch(e.target.value)}
                      placeholder="Search in wishlist..."
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-neutral-200/90 rounded-xl focus:outline-none focus:border-brand-maroon shadow-2xs font-semibold text-neutral-900"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  </div>

                  <select
                    value={wishlistSort}
                    onChange={(e) => setWishlistSort(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-700 shadow-2xs focus:outline-none focus:border-brand-maroon shrink-0 self-stretch sm:self-auto cursor-pointer"
                  >
                    <option value="newest">Sort by: Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* 4-Column Responsive Grid */}
                {displayWishlist.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80 shadow-2xs space-y-3">
                    <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                    <h3 className="font-serif font-bold text-base text-neutral-800">
                      Your wishlist is empty
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Explore our handcrafted ethnic collection and tap the heart icon to save your favorites.
                    </p>
                    <Link
                      to="/new-arrivals"
                      className="inline-block px-5 py-2.5 bg-[#5A1827] text-white text-xs font-bold rounded-xl shadow-2xs"
                    >
                      Shop New Arrivals
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayWishlist.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-2xs flex flex-col justify-between group hover:shadow-xs transition-shadow"
                      >
                        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                          <Link to={getProductUrl(item)}>
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>

                          {/* Floating Red Heart */}
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs cursor-pointer hover:bg-white transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">
                              {item.title}
                            </h4>

                            {/* Price & Discount */}
                            <div className="flex items-center space-x-1.5 text-xs">
                              <span className="font-bold text-neutral-900">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              {item.original_price && item.original_price > item.price && (
                                <>
                                  <span className="text-[11px] text-neutral-400 line-through">
                                    ₹{item.original_price.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded">
                                    {item.discount_percent || 36}% OFF
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Rating & Reviews */}
                            <div className="flex items-center space-x-1 text-[10px] text-neutral-500">
                              <div className="flex items-center text-amber-500">
                                <Star className="w-3 h-3 fill-amber-400" />
                              </div>
                              <span className="font-bold text-neutral-700">{item.rating || '4.7'}</span>
                              <span>(120)</span>
                            </div>

                            {/* Color Swatches */}
                            <div className="flex items-center space-x-1 pt-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#5A1827] border border-white" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#9B4553] border border-white" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#2A4D3E] border border-white" />
                              <span className="text-[10px] text-neutral-400 font-semibold">+2</span>
                            </div>
                          </div>

                          {/* Add to Cart & Trash */}
                          <div className="flex items-center space-x-1.5 pt-2 border-t border-neutral-100">
                            <button
                              onClick={() => addToCart(item, 'M', 'Standard', 1)}
                              className="flex-1 py-2 bg-[#5A1827] hover:bg-[#43121D] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(item)}
                              className="p-2 border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-neutral-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete from Wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: MY ADDRESSES */}
            {/* ========================================================= */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title + Add New Address Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                      My Addresses
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                      Manage your saved addresses for faster checkout.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* 2-Column Responsive Address Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentAddresses.map((addr) => {
                    const isDef = Boolean(addr.is_default);
                    const tagType = addr.type || 'Home';

                    return (
                      <div
                        key={addr.id}
                        className={`bg-white rounded-2xl p-5 border shadow-2xs space-y-3 relative transition-all ${
                          isDef ? 'border-[#5A1827]/30 ring-1 ring-[#5A1827]/20' : 'border-neutral-200/80'
                        }`}
                      >
                        {/* Top Header: Tag Badge + Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {tagType === 'Home' && <Home className="w-3.5 h-3.5 text-brand-maroon" />}
                            {tagType === 'Office' && <Building className="w-3.5 h-3.5 text-brand-maroon" />}
                            {tagType === 'Other' && <MapPin className="w-3.5 h-3.5 text-brand-maroon" />}

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isDef
                                  ? 'bg-[#FBF1F3] text-[#5A1827]'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {isDef ? 'Default Address' : tagType}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 text-neutral-400">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1 hover:text-neutral-800 transition-colors cursor-pointer"
                              title="Edit Address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-neutral-900">{addr.name}</p>
                          <p className="text-neutral-500">{addr.phone}</p>
                          <p className="text-neutral-700 leading-relaxed pt-1">
                            {addr.address_line1} {addr.address_line2 ? `${addr.address_line2}, ` : ''}
                            <br />
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>, India
                          </p>
                        </div>

                        {/* Bottom Radio Status */}
                        <div className="pt-2 border-t border-neutral-100">
                          {isDef ? (
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Default Address</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            >
                              <div className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center" />
                              <span>Set as Default</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: PAYMENT METHODS */}
            {/* ========================================================= */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    Payment Methods
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage your saved payment methods for a faster and more secure checkout.
                  </p>
                </div>

                {paymentSaveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{paymentSaveSuccess}</span>
                  </div>
                )}

                {/* Card 1: Saved Payment Methods */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <h3 className="font-bold text-sm text-neutral-900">
                      Saved Payment Methods
                    </h3>
                    <span className="text-[11px] text-neutral-500 flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      <span>Your payment information is secure and encrypted.</span>
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 space-y-1">
                    {savedPayments.map((pm) => (
                      <div
                        key={pm.id}
                        className="pt-3 pb-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="default_pm"
                            checked={pm.isDefault}
                            onChange={() => handleSetDefaultPayment(pm.id)}
                            className="accent-[#5A1827] w-4 h-4 cursor-pointer"
                          />

                          {/* Brand Icon Tag */}
                          <div className="w-10 h-7 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center font-bold text-[10px] text-neutral-800 uppercase shrink-0">
                            {pm.type === 'visa' && <span className="text-blue-700">VISA</span>}
                            {pm.type === 'mastercard' && <span className="text-amber-600">MC</span>}
                            {pm.type === 'upi' && <span className="text-emerald-700">UPI</span>}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-neutral-900">
                                {pm.type === 'upi' ? pm.brand : `${pm.brand} ${pm.numberMasked}`}
                              </span>
                              {pm.isDefault && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              {pm.type === 'upi' ? pm.upiId : `Expires ${pm.expiry}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-neutral-600">
                          <span className="hidden sm:inline-block font-semibold text-neutral-800">
                            {pm.nameOnCard || user?.name}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(pm.id)}
                            className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete Payment Method"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Add a New Payment Method */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
                  <h3 className="font-bold text-sm text-neutral-900">
                    Add a New Payment Method
                  </h3>

                  {/* 4 Method Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        key: 'card',
                        title: 'Credit / Debit Card',
                        desc: 'Visa, Mastercard, RuPay',
                        icon: CreditCard
                      },
                      {
                        key: 'upi',
                        title: 'UPI',
                        desc: 'Google Pay, PhonePe, Paytm',
                        icon: Sparkles
                      },
                      {
                        key: 'netbanking',
                        title: 'Net Banking',
                        desc: 'All major banks supported',
                        icon: Building
                      },
                      {
                        key: 'wallets',
                        title: 'Wallets',
                        desc: 'Paytm, Amazon Pay, Mobikwik',
                        icon: ShoppingBag
                      }
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSel = paymentMethodType === method.key;
                      return (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPaymentMethodType(method.key)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#5A1827] bg-[#FBF1F3]/40 ring-1 ring-[#5A1827]/20 shadow-2xs'
                              : 'border-neutral-200 bg-white hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Icon
                              className={`w-4 h-4 ${isSel ? 'text-[#5A1827]' : 'text-neutral-500'}`}
                            />
                            <ChevronRight
                              className={`w-3.5 h-3.5 ${isSel ? 'text-[#5A1827]' : 'text-neutral-300'}`}
                            />
                          </div>
                          <p
                            className={`font-bold text-xs ${
                              isSel ? 'text-[#5A1827]' : 'text-neutral-900'
                            }`}
                          >
                            {method.title}
                          </p>
                          <span className="text-[10px] text-neutral-400 line-clamp-1">
                            {method.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card Form */}
                  {paymentMethodType === 'card' && (
                    <form onSubmit={handleSaveNewCard} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="1234 5678 9012 3456"
                              value={newCard.number}
                              onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                              className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                            />
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Expiry Date
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="MM/YY"
                              value={newCard.expiry}
                              onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                              className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            CVV
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              required
                              maxLength={4}
                              placeholder="123"
                              value={newCard.cvv}
                              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                              className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Name on Card
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Arijit Singh"
                              value={newCard.name}
                              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                              className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newCard.isDefault}
                            onChange={(e) => setNewCard({ ...newCard, isDefault: e.target.checked })}
                            className="accent-[#5A1827] rounded"
                          />
                          <span>Set as default payment method</span>
                        </label>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Save Card
                        </button>
                      </div>
                    </form>
                  )}

                  {/* UPI Form */}
                  {paymentMethodType === 'upi' && (
                    <form onSubmit={handleSaveNewUpi} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          UPI ID (e.g. mobile@paytm, name@okhdfcbank)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="yourname@bank"
                          value={newUpi.upiId}
                          onChange={(e) => setNewUpi({ ...newUpi, upiId: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
                        >
                          Verify & Save UPI
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: OFFERS & COUPONS */}
            {/* ========================================================= */}
            {activeTab === 'offers' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title + Coupon Code Apply Box */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                      Offers & Coupons
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                      Save more on your favourite products with exclusive offers and discount coupons.
                    </p>
                  </div>

                  {/* Top Right Apply Coupon Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customCouponInput.trim()) {
                        applyCoupon(customCouponInput.trim().toUpperCase());
                        setCouponApplyFeedback(`Coupon ${customCouponInput.trim().toUpperCase()} applied!`);
                        setCustomCouponInput('');
                        setTimeout(() => setCouponApplyFeedback(''), 3000);
                      }
                    }}
                    className="flex items-center space-x-2 w-full md:w-auto"
                  >
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={customCouponInput}
                      onChange={(e) => setCustomCouponInput(e.target.value)}
                      className="w-full sm:w-56 text-xs px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon uppercase font-mono font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                {couponApplyFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{couponApplyFeedback}</span>
                  </div>
                )}

                {/* Sub-Category Tabs */}
                <div className="flex items-center space-x-2 border-b border-neutral-200/80 text-xs font-bold">
                  {[
                    { key: 'available', label: 'Available Coupons (6)' },
                    { key: 'my_coupons', label: 'My Coupons (2)' },
                    { key: 'expired', label: 'Expired Coupons (4)' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCouponTab(tab.key)}
                      className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                        couponTab === tab.key
                          ? 'border-[#5A1827] text-[#5A1827]'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Top Featured Promo Banners (2 Side-by-Side Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Banner 1: Festive Special */}
                  <div className="bg-[#EEDEC8] border border-[#DECDB3] rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="relative z-10 space-y-1">
                      <span className="text-xs font-serif italic text-neutral-800 block">
                        Festive Special
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        FLAT 10% OFF
                      </h3>
                      <p className="text-xs text-neutral-700">
                        on all Sarees &amp; Designer Suits
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2">
                      <div className="border border-dashed border-neutral-700 bg-white/80 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-neutral-900">
                        Use Code: <span className="text-[#5A1827]">SAREE10</span>
                      </div>
                      <Link
                        to="/new-arrivals"
                        className="px-4 py-1.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        Shop Now
                      </Link>
                    </div>

                    {/* Mockup visual on right */}
                    <div className="hidden sm:block absolute right-3 bottom-2 w-40 h-28 bg-white/80 rounded-xl shadow-md border border-neutral-200 overflow-hidden transform rotate-2 p-1.5">
                      <div className="w-full h-full bg-[#9B4553]/10 rounded flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-[10px] font-serif font-bold text-[#5A1827]">OCT9 LUXURY</span>
                        <span className="text-[8px] text-neutral-500">Festive Edit 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner 2: Prepaid Orders */}
                  <div className="bg-[#FAD9CE] border border-[#ECC0B2] rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="relative z-10 space-y-1">
                      <span className="text-xs text-neutral-800 font-semibold block">
                        Prepaid Orders
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        EXTRA 5% OFF
                      </h3>
                      <p className="text-xs text-neutral-700">
                        on all orders
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2">
                      <div className="border border-dashed border-neutral-700 bg-white/80 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-neutral-900">
                        Use Code: <span className="text-[#5A1827]">PREPAID5</span>
                      </div>
                      <Link
                        to="/new-arrivals"
                        className="px-4 py-1.5 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        Shop Now
                      </Link>
                    </div>

                    {/* Decorative Graphic on right */}
                    <div className="hidden sm:flex absolute right-4 bottom-3 space-x-1 items-end opacity-80">
                      <div className="w-3.5 h-12 bg-amber-600 rounded-t" />
                      <div className="w-3.5 h-16 bg-[#5A1827] rounded-t" />
                      <div className="w-3.5 h-8 bg-rose-400 rounded-t" />
                    </div>
                  </div>
                </div>

                {/* Available Coupons Section Header */}
                <div className="pt-2">
                  <h3 className="font-serif font-bold text-base text-neutral-900 mb-3">
                    Available Coupons
                  </h3>

                  {/* 2-Column Grid of Coupons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'c_1',
                        code: 'SAREE10',
                        badgeText: '10%',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#FDF2F4]',
                        badgeTextColor: 'text-[#B8233D]',
                        title: 'Flat 10% Off on all Sarees',
                        minOrder: 'Min. order value ₹1,999',
                        details: 'Valid on all Silk, Banarasi, Organza and Chiffon Sarees. Max discount ₹2,000.'
                      },
                      {
                        id: 'c_2',
                        code: 'FESTIVE15',
                        badgeText: '15%',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#FFF8E5]',
                        badgeTextColor: 'text-[#A47012]',
                        title: 'Flat 15% Off on Suits & Juttis',
                        minOrder: 'Min. order value ₹2,999',
                        details: 'Applicable on Handcrafted Anarkalis, Punjabi Suits, and Embroidered Juttis.'
                      },
                      {
                        id: 'c_3',
                        code: 'PREPAID5',
                        badgeText: '5%',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#EBF9F1]',
                        badgeTextColor: 'text-[#1E824C]',
                        title: 'Extra 5% Off on Prepaid Orders',
                        minOrder: 'No min. num order value',
                        details: 'Instant discount applied on Razorpay online payments (UPI, Netbanking, Cards).'
                      },
                      {
                        id: 'c_4',
                        code: 'WELCOME500',
                        badgeText: '₹500',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#F3EFFC]',
                        badgeTextColor: 'text-[#6B3FA0]',
                        title: 'Flat ₹500 Off on First Order',
                        minOrder: 'Min. order value ₹2,499',
                        details: 'Exclusive inaugural luxury gift for newly registered OCT9 members.'
                      },
                      {
                        id: 'c_5',
                        code: 'OCTFEST20',
                        badgeText: '20%',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#FFF2EB]',
                        badgeTextColor: 'text-[#D35400]',
                        title: 'Flat 20% Off on Festive Collection',
                        minOrder: 'Min. order value ₹4,999',
                        details: 'Applicable across our Grand Royal Wedding & Festive Wardrobe collection.'
                      },
                      {
                        id: 'c_6',
                        code: 'JUTTI300',
                        badgeText: '₹300',
                        badgeSub: 'OFF',
                        badgeBg: 'bg-[#EBF7FC]',
                        badgeTextColor: 'text-[#1F7A9C]',
                        title: 'Flat ₹300 Off on Juttis',
                        minOrder: 'Min. order value ₹1,499',
                        details: 'Valid on genuine leather artisan-crafted bridal and daily wear juttis.'
                      }
                    ].map((coupon) => (
                      <div
                        key={coupon.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left Badge */}
                          <div
                            className={`w-16 h-16 rounded-xl ${coupon.badgeBg} ${coupon.badgeTextColor} flex flex-col items-center justify-center font-bold shrink-0`}
                          >
                            <span className="text-sm sm:text-base leading-none">{coupon.badgeText}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                              {coupon.badgeSub}
                            </span>
                          </div>

                          {/* Middle Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-mono font-bold text-xs sm:text-sm text-neutral-900 truncate">
                              {coupon.code}
                            </h4>
                            <p className="text-xs text-neutral-700 font-semibold truncate">
                              {coupon.title}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {coupon.minOrder}
                            </p>
                            <button
                              onClick={() => setExpandedCouponId(expandedCouponId === coupon.id ? null : coupon.id)}
                              className="text-[11px] text-brand-maroon font-semibold hover:underline flex items-center space-x-0.5 cursor-pointer pt-0.5"
                            >
                              <span>View Details</span>
                              <span>{expandedCouponId === coupon.id ? '▴' : '▾'}</span>
                            </button>
                          </div>

                          {/* Right Apply Button */}
                          <button
                            onClick={() => {
                              applyCoupon(coupon.code);
                              setCouponApplyFeedback(`Coupon ${coupon.code} applied successfully!`);
                              setTimeout(() => setCouponApplyFeedback(''), 3000);
                            }}
                            className="px-4 py-2 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            Apply
                          </button>
                        </div>

                        {/* Expandable Terms */}
                        {expandedCouponId === coupon.id && (
                          <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-600 bg-neutral-50/70 p-2.5 rounded-lg animate-fadeIn">
                            {coupon.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 7: NOTIFICATIONS */}
            {/* ========================================================= */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title + Mark All as Read */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                      Notifications
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                      Stay updated with your orders, offers, and account activity.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark All as Read</span>
                  </button>
                </div>

                {/* Sub-Category Filter Tabs */}
                <div className="flex items-center space-x-2 border-b border-neutral-200/80 text-xs font-bold overflow-x-auto no-scrollbar">
                  {[
                    { key: 'all', label: `All (${notificationsList.length})` },
                    { key: 'orders', label: `Orders (${notificationsList.filter(n => n.category === 'orders').length})` },
                    { key: 'offers', label: `Offers (${notificationsList.filter(n => n.category === 'offers').length})` },
                    { key: 'account', label: `Account (${notificationsList.filter(n => n.category === 'account').length})` },
                    { key: 'updates', label: `Updates (${notificationsList.filter(n => n.category === 'updates').length})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setNotificationFilter(tab.key)}
                      className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                        notificationFilter === tab.key
                          ? 'border-[#5A1827] text-[#5A1827]'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Stack of Notification Cards */}
                <div className="space-y-3">
                  {notificationsList
                    .filter(n => notificationFilter === 'all' || n.category === notificationFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                          {/* Unread Red Dot */}
                          <div className="w-2 flex justify-center shrink-0">
                            {item.unread && (
                              <div className="w-2 h-2 rounded-full bg-red-600" />
                            )}
                          </div>

                          {/* Thumbnail / Category Icon */}
                          <div className="shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-12 rounded-lg object-cover bg-neutral-100 shadow-2xs"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  item.iconBg || 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                {item.iconType === 'gift' && <Tag className="w-4 h-4 text-[#B8233D]" />}
                                {item.iconType === 'truck' && <Truck className="w-4 h-4 text-[#1F7A9C]" />}
                                {item.iconType === 'heart' && <Heart className="w-4 h-4 text-[#B8233D]" />}
                                {item.iconType === 'percent' && <span className="text-sm font-bold text-[#6B3FA0]">%</span>}
                                {item.iconType === 'star' && <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                                {item.iconType === 'shield' && <Bell className="w-4 h-4 text-blue-600" />}
                                {item.iconType === 'settings' && <Settings className="w-4 h-4 text-neutral-600" />}
                              </div>
                            )}
                          </div>

                          {/* Notification Text Content */}
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-neutral-900">
                                {item.title}
                              </h4>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    item.badge === 'Delivered'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : item.badge === 'Shipped'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : item.badge === 'Special Offer'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        {/* Right Actions & Timestamp */}
                        <div className="flex items-center space-x-3 shrink-0">
                          {/* Optional Call to Action button */}
                          {item.actionButton && (
                            <Link
                              to={item.actionButton.link}
                              className="hidden sm:inline-block px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-[11px] font-semibold rounded-lg transition-colors"
                            >
                              {item.actionButton.label}
                            </Link>
                          )}

                          <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                            {item.time}
                          </span>

                          <button
                            onClick={() => {
                              setNotificationsList(prev => prev.filter(n => n.id !== item.id));
                            }}
                            className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                            title="Dismiss"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 8: SETTINGS */}
            {/* ========================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    Account Settings
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage password, communication preferences, and security.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-neutral-900">Notifications Preferences</h3>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-[#5A1827] rounded" />
                        <span>Receive Order Status Updates via SMS & WhatsApp</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-[#5A1827] rounded" />
                        <span>Email newsletters for new festive designer drops</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    <h3 className="font-bold text-sm text-neutral-900">Security</h3>
                    <button
                      onClick={() => alert('Password reset link has been dispatched to your email.')}
                      className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Change Account Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ASSURANCE BANNER (ACROSS ALL PAGES) */}
        {/* ========================================================= */}
        <div className="bg-[#FAF3EA] border border-[#EFE3D3] rounded-3xl p-6 sm:p-8 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-brand-maroon flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Free Shipping</h4>
              <p className="text-[11px] text-neutral-500">Orders above ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-brand-maroon flex items-center justify-center shrink-0 shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Easy Returns</h4>
              <p className="text-[11px] text-neutral-500">7 days hassle free</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-brand-maroon flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Secure Payments</h4>
              <p className="text-[11px] text-neutral-500">100% safe & secure</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-brand-maroon flex items-center justify-center shrink-0 shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Premium Quality</h4>
              <p className="text-[11px] text-neutral-500">Finest fabrics & craft</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-base text-neutral-900">
                {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddressSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat, House no., Building, Street"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Area, Landmark, Sector"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="110001"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon font-semibold"
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                  Address Type
                </label>
                <div className="flex space-x-2 text-xs">
                  {['Home', 'Office', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type: t })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        addressForm.type === t
                          ? 'bg-[#5A1827] text-white border-[#5A1827]'
                          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="accent-[#5A1827] rounded"
                />
                <span className="font-semibold text-neutral-800">Set as default delivery address</span>
              </label>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shiprocket Live Tracking Modal */}
      {selectedWaybill && (
        <ShiprocketTrackerModal
          waybill={selectedWaybill}
          isOpen={Boolean(selectedWaybill)}
          onClose={() => setSelectedWaybill(null)}
        />
      )}
    </div>
  );
}

// Helpers for Sample Seed Data matching user screenshots
function getInitialSampleOrders(user) {
  return [
    {
      id: 101,
      order_number: 'OCT9123456',
      grand_total: 1799,
      order_status: 'delivered',
      shiprocket_status: 'delivered',
      delhivery_status: 'delivered',
      payment_status: 'paid',
      payment_method: 'upi',
      created_at: '2026-09-12T10:24:00.000Z',
      shiprocket_awb: 'SR8492019482',
      delhivery_waybill: 'SR8492019482',
      customer_name: user?.name || 'Arijit Singh',
      customer_email: user?.email || 'arijit.singh@example.com',
      customer_phone: user?.phone || '9876543210',
      shipping_address: JSON.stringify({
        address_line1: 'A-12, Subhash Park Extension',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110032'
      }),
      items: [
        {
          product_id: 1,
          product_title: 'Georgette Party Wear Saree',
          quantity: 1,
          price: 1799,
          total: 1799,
          size: 'Free Size',
          color: 'Maroon',
          product_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 102,
      order_number: 'OCT9123401',
      grand_total: 899,
      order_status: 'shipped',
      shiprocket_status: 'in_transit',
      delhivery_status: 'in_transit',
      payment_status: 'paid',
      payment_method: 'card',
      created_at: '2026-09-08T16:15:00.000Z',
      shiprocket_awb: 'SR8492019483',
      delhivery_waybill: 'SR8492019483',
      customer_name: user?.name || 'Arijit Singh',
      customer_email: user?.email || 'arijit.singh@example.com',
      customer_phone: user?.phone || '9876543210',
      shipping_address: JSON.stringify({
        address_line1: 'A-12, Subhash Park Extension',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110032'
      }),
      items: [
        {
          product_id: 4,
          product_title: 'Embroidered Punjabi Jutti',
          quantity: 1,
          price: 899,
          total: 899,
          size: '38',
          color: 'Beige',
          product_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 103,
      order_number: 'OCT9123305',
      grand_total: 799,
      order_status: 'delivered',
      delhivery_status: 'delivered',
      payment_status: 'paid',
      payment_method: 'cod',
      created_at: '2026-09-01T14:35:00.000Z',
      delhivery_waybill: '68386110000088',
      customer_name: user?.name || 'Arijit Singh',
      customer_email: user?.email || 'arijit.singh@example.com',
      customer_phone: user?.phone || '9876543210',
      shipping_address: JSON.stringify({
        address_line1: 'House No. 45, Green Park',
        city: 'Agra',
        state: 'Uttar Pradesh',
        pincode: '282001'
      }),
      items: [
        {
          product_id: 5,
          product_title: 'Traditional Jhumka Earrings',
          quantity: 1,
          price: 799,
          total: 799,
          size: 'Free Size',
          color: 'Gold',
          product_image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 104,
      order_number: 'OCT9123112',
      grand_total: 2499,
      order_status: 'cancelled',
      delhivery_status: 'cancelled',
      payment_status: 'refunded',
      payment_method: 'card',
      created_at: '2026-08-25T11:20:00.000Z',
      customer_name: user?.name || 'Arijit Singh',
      customer_email: user?.email || 'arijit.singh@example.com',
      customer_phone: user?.phone || '9876543210',
      shipping_address: JSON.stringify({
        address_line1: 'A-12, Subhash Park Extension',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110032'
      }),
      items: [
        {
          product_id: 2,
          product_title: 'Banarasi Silk Saree',
          quantity: 1,
          price: 2499,
          total: 2499,
          size: 'Free Size',
          color: 'Emerald Green',
          product_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
        }
      ]
    }
  ];
}

function getSampleWishlist() {
  return [
    {
      id: 1001,
      title: 'Banarasi Party Wear Saree',
      slug: 'banarasi-party-wear-saree',
      price: 3499,
      original_price: 5499,
      discount_percent: 36,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1002,
      title: 'Kanjivaram Silk Saree',
      slug: 'kanjivaram-silk-saree',
      price: 4299,
      original_price: 6999,
      discount_percent: 39,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1003,
      title: 'Embroidered Punjabi Suit',
      slug: 'embroidered-punjabi-suit',
      price: 1999,
      original_price: 2999,
      discount_percent: 33,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1004,
      title: 'Embroidered Jutti',
      slug: 'embroidered-jutti',
      price: 899,
      original_price: 1299,
      discount_percent: 31,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1005,
      title: 'Traditional Jhumka Earrings',
      slug: 'traditional-jhumka-earrings',
      price: 799,
      original_price: 1299,
      discount_percent: 36,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1006,
      title: 'Organza Designer Saree',
      slug: 'organza-designer-saree',
      price: 2999,
      original_price: 4999,
      discount_percent: 40,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1007,
      title: 'Festive Wear Suit Set',
      slug: 'festive-wear-suit-set',
      price: 2499,
      original_price: 3999,
      discount_percent: 38,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 1008,
      title: 'Chikankari Saree',
      slug: 'chikankari-saree',
      price: 3199,
      original_price: 4999,
      discount_percent: 36,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80'
    }
  ];
}
