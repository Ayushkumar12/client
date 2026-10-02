import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { api } from '../../services/api.js';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef(null);
  const accountMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearchDropdown(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.getProducts({ search: searchQuery.trim(), limit: 5 });
          if (res.success) {
            setSearchResults(res.products);
            setShowSearchDropdown(true);
          }
        } catch (e) {
          // ignore
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'New Arrivals', path: '/new-arrivals', badge: 'NEW' },
    {
      label: 'Suits',
      path: '/category/suits',
      children: [
        { label: 'All Suits', path: '/category/suits' },
        { label: 'Anarkali Suits', path: '/category/suits?sub_category=Anarkali+Suits' },
        { label: 'Straight Suits', path: '/category/suits?sub_category=Straight+Suits' },
        { label: 'Palazzo Suits', path: '/category/suits?sub_category=Palazzo+Suits' },
        { label: 'Sharara Suits', path: '/category/suits?sub_category=Sharara+Suits' },
        { label: 'Cotton Suits', path: '/category/suits?sub_category=Cotton+Suits' },
      ]
    },
    { label: 'Designer Suits', path: '/category/designer-suits' },
    { label: 'Festive Wear', path: '/category/festive-wear' },
    { label: 'Party Wear', path: '/category/party-wear' },
    { label: 'Sarees', path: '/category/sarees' },
    { label: 'Accessories', path: '/category/accessories' },
    { label: 'Jutti', path: '/category/jutti' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161616] text-white shadow-xl">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu toggle button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 text-neutral-300 hover:text-brand-gold focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo matching user upload */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/oct9-logo.jpg"
            alt="OCT9 - Luxury Without Noise"
            className="h-10 sm:h-11 w-auto rounded-lg object-contain border border-neutral-700/60 transition-transform duration-300 group-hover:scale-105 shadow-xs"
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.2em] text-white group-hover:text-brand-gold transition-colors leading-tight">
              OCT<span className="text-brand-gold">9</span>
            </span>
            <span className="text-[8px] tracking-[0.25em] uppercase text-neutral-300 font-medium hidden sm:block">
              Luxury Without Noise
            </span>
          </div>
        </Link>

        {/* Search Bar matching screenshot */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for suits, salwar sets, sarees, festive wear, accessories..."
              className="w-full bg-[#242424] text-white placeholder-neutral-400 text-xs sm:text-sm pl-11 pr-24 py-2.5 rounded-full border border-neutral-700/60 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Live Search Auto-complete dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#1C1C1C] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Suggested Products
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800">
                {searchResults.map((product) => {
                  const img = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="flex items-center space-x-3 p-2.5 hover:bg-neutral-800/80 transition-colors"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      <img src={img} alt={product.title} className="w-12 h-14 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.title}</p>
                        <p className="text-xs text-neutral-400 capitalize">{product.sub_category || product.category_slug}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-sm font-semibold text-brand-gold">₹{product.price}</span>
                          <span className="text-xs text-neutral-500 line-through">₹{product.original_price}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2 bg-neutral-900 text-brand-gold text-xs text-center font-medium hover:bg-neutral-800 transition-colors"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        {/* Right Actions: Account, Wishlist, Cart */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Account Menu */}
          <div ref={accountMenuRef} className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center space-x-1.5 text-neutral-200 hover:text-brand-gold transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <User className="w-4 h-4 text-brand-gold" />
              </div>
              <span className="text-xs font-medium hidden md:inline-block">
                {isAuthenticated ? (user.name.split(' ')[0]) : 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:block" />
            </button>

            {/* Account Dropdown */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1E1E1E] border border-neutral-700/80 rounded-xl shadow-2xl py-2 z-50 text-xs animate-fadeIn">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-neutral-800">
                      <p className="text-white font-semibold truncate">{user.name}</p>
                      <p className="text-neutral-400 text-[11px] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account"
                      className="flex items-center space-x-2 px-4 py-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-brand-gold"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/account?tab=orders"
                      className="flex items-center space-x-2 px-4 py-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-brand-gold"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2.5 text-brand-gold bg-brand-maroon/20 hover:bg-brand-maroon/30 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-gold" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}

                    <div className="border-t border-neutral-800 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-neutral-800 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-neutral-300 font-medium mb-2">Welcome to OCT9</p>
                    <Link
                      to="/login"
                      className="block w-full py-2 bg-brand-maroon text-white font-semibold rounded-lg hover:bg-brand-maroon-hover transition-colors mb-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block text-brand-gold hover:underline text-[11px]"
                    >
                      New customer? Create account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative p-1.5 text-neutral-200 hover:text-brand-gold transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-gold text-neutral-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Drawer Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center space-x-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-md group"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-brand-gold group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="bg-white text-brand-maroon text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row (visible on small screens) */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suits, sarees, festive wear..."
            className="w-full bg-[#242424] text-white text-xs pl-9 pr-16 py-2 rounded-full border border-neutral-700 focus:outline-none focus:border-brand-gold"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-maroon text-white text-[11px] px-2.5 py-1 rounded-full"
          >
            Go
          </button>
        </form>
      </div>

      {/* Category Navigation Bar (Desktop) matching screenshots */}
      <nav className="hidden lg:block bg-[#121212] border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            const hasChildren = link.children && link.children.length > 0;

            return (
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => hasChildren && setActiveDropdown(link.label)}
                onMouseLeave={() => hasChildren && setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={`flex items-center space-x-1 px-4 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-brand-gold border-b-2 border-brand-gold font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-brand-maroon text-white text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-normal">
                      {link.badge}
                    </span>
                  )}
                  {hasChildren && <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-brand-gold transition-transform group-hover:rotate-180" />}
                </Link>

                {/* Subcategory dropdown menu */}
                {hasChildren && (
                  <div className="absolute left-0 top-full w-56 bg-[#1A1A1A] border border-neutral-800 shadow-2xl rounded-b-lg py-2 hidden group-hover:block z-50 animate-fadeIn">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-brand-gold transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-black/80 backdrop-blur-sm z-50 flex">
          <div className="w-4/5 max-w-sm bg-[#181818] h-full overflow-y-auto p-5 border-r border-neutral-800 text-sm animate-slideRight">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <img src="/oct9-logo.jpg" alt="OCT9" className="h-8 w-auto rounded object-contain" />
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-white tracking-widest leading-none">OCT9</span>
                  <span className="text-[7px] uppercase tracking-wider text-neutral-400">Luxury Without Noise</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800 hover:text-brand-gold"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="bg-brand-maroon text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                  {link.children && (
                    <div className="pl-6 space-y-1 mt-1 border-l-2 border-neutral-800 ml-3">
                      {link.children.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          className="block py-1.5 text-xs text-neutral-400 hover:text-brand-gold"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-800 pt-4 space-y-2">
              <Link
                to="/track-order"
                className="flex items-center space-x-2 py-2 text-brand-gold"
              >
                <Package className="w-4 h-4" />
                <span>Track Delhivery Order</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 py-2 text-amber-400 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
}
