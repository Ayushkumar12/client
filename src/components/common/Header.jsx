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

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white text-neutral-900 border-b border-neutral-200/90 shadow-2xs transition-all">
      {/* Main Header Row - Compact Height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile menu toggle button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 text-neutral-700 hover:text-brand-maroon focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo matching user specifications */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
          <img
            src="/oct9-logo.jpg"
            alt="OCT9 - Luxury Without Noise"
            className="h-8 sm:h-9 w-auto rounded-lg object-contain border border-neutral-200 shadow-2xs transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.18em] text-neutral-900 group-hover:text-brand-maroon transition-colors leading-tight">
              OCT<span className="text-brand-maroon">9</span>
            </span>
            <span className="text-[7.5px] tracking-[0.22em] uppercase text-neutral-500 font-medium hidden sm:block">
              Luxury Without Noise
            </span>
          </div>
        </Link>

        {/* Search Bar - Sleek & Compact */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for suits, salwar sets, sarees, festive wear, accessories..."
              className="w-full bg-[#FAF7F2] text-neutral-900 placeholder-neutral-400 text-xs pl-9 pr-20 py-1.5 sm:py-2 rounded-full border border-neutral-300/90 focus:border-brand-maroon focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-maroon shadow-2xs font-medium transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#5A1827] hover:bg-[#43121D] text-white text-[11px] px-3 py-1 rounded-full font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Live Search Auto-complete dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-200/90 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-neutral-100 text-[10px] text-neutral-500 uppercase tracking-wider font-bold bg-[#FAF7F2]">
                Suggested Products
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {searchResults.map((product) => {
                  const img = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="flex items-center space-x-3 p-2.5 hover:bg-neutral-50 transition-colors"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      <img src={img} alt={product.title} className="w-10 h-12 object-cover rounded border border-neutral-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{product.title}</p>
                        <p className="text-[10px] text-neutral-500 capitalize">{product.sub_category || product.category_slug}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs font-bold text-brand-maroon">₹{product.price}</span>
                          <span className="text-[10px] text-neutral-400 line-through">₹{product.original_price}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2 bg-[#FAF7F2] text-brand-maroon text-xs text-center font-bold hover:bg-neutral-100 transition-colors"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        {/* Right Actions: Account, Wishlist, Cart */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Account Menu */}
          <div ref={accountMenuRef} className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center space-x-1.5 text-neutral-800 hover:text-brand-maroon transition-colors focus:outline-none cursor-pointer py-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F5EBE1] text-[#5A1827] flex items-center justify-center border border-[#E8DCCF] font-serif font-bold text-xs shrink-0 shadow-2xs">
                {isAuthenticated ? userInitials : <User className="w-3.5 h-3.5 text-brand-maroon" />}
              </div>
              <span className="text-xs font-semibold hidden md:inline-block">
                {isAuthenticated ? (user.name.split(' ')[0]) : 'Account'}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400 hidden md:block" />
            </button>

            {/* Account Dropdown */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200/90 rounded-xl shadow-2xl py-2 z-50 text-xs animate-fadeIn">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-neutral-100 bg-[#FAF7F2]">
                      <p className="text-neutral-900 font-bold truncate">{user.name}</p>
                      <p className="text-neutral-500 text-[11px] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account?tab=profile"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-maroon transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/account?tab=orders"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-maroon transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    <Link
                      to="/account?tab=wishlist"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-maroon transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      to="/account?tab=addresses"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-maroon transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Saved Addresses</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-brand-maroon bg-[#FBF1F3] hover:bg-[#F8E5E9] font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-maroon" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}

                    <div className="border-t border-neutral-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-rose-700 hover:bg-rose-50 text-left cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <p className="text-neutral-700 font-bold text-xs">Welcome to OCT9</p>
                    <Link
                      to="/login"
                      className="block w-full py-2 bg-[#5A1827] text-white font-bold rounded-lg hover:bg-[#43121D] transition-colors text-xs shadow-2xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block text-brand-maroon font-semibold hover:underline text-[11px]"
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
            className="relative p-1.5 text-neutral-700 hover:text-brand-maroon transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#5A1827] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Drawer Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center space-x-1.5 bg-[#5A1827] hover:bg-[#43121D] text-white px-3 py-1.5 rounded-full transition-all duration-200 shadow-2xs group cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="bg-white text-[#5A1827] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row (visible on small screens) */}
      <div className="sm:hidden px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suits, sarees, festive wear..."
            className="w-full bg-[#FAF7F2] text-neutral-900 text-xs pl-8 pr-14 py-1.5 rounded-full border border-neutral-300 focus:outline-none focus:border-brand-maroon focus:bg-white font-medium"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#5A1827] text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
          >
            Go
          </button>
        </form>
      </div>

      {/* Category Navigation Bar (Desktop) - White & Compact */}
      <nav className="hidden lg:block bg-white border-t border-neutral-100">
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
                  className={`flex items-center space-x-1 px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-[#5A1827] border-b-2 border-[#5A1827] font-bold'
                      : 'text-neutral-700 hover:text-[#5A1827] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-[#5A1827] text-white text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-normal">
                      {link.badge}
                    </span>
                  )}
                  {hasChildren && <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-brand-maroon transition-transform group-hover:rotate-180" />}
                </Link>

                {/* Subcategory dropdown menu */}
                {hasChildren && (
                  <div className="absolute left-0 top-full w-52 bg-white border border-neutral-200/90 shadow-xl rounded-b-xl py-1.5 hidden group-hover:block z-50 animate-fadeIn">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-[#FAF7F2] hover:text-brand-maroon transition-colors"
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
        <div className="lg:hidden fixed inset-0 top-[100px] bg-black/50 backdrop-blur-xs z-50 flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-5 border-r border-neutral-200 text-sm animate-slideRight">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center space-x-2.5">
                <img src="/oct9-logo.jpg" alt="OCT9" className="h-8 w-auto rounded object-contain border border-neutral-200" />
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-neutral-900 tracking-widest leading-none">OCT9</span>
                  <span className="text-[7px] uppercase tracking-wider text-neutral-500">Luxury Without Noise</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-500 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-neutral-800 font-semibold hover:bg-[#FAF7F2] hover:text-brand-maroon"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="bg-[#5A1827] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                  {link.children && (
                    <div className="pl-6 space-y-1 mt-1 border-l-2 border-neutral-200 ml-3">
                      {link.children.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          className="block py-1.5 text-xs text-neutral-600 hover:text-brand-maroon font-medium"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
              <Link
                to="/track-order"
                className="flex items-center space-x-2 py-2 text-brand-maroon font-bold"
              >
                <Package className="w-4 h-4" />
                <span>Track Delhivery Order</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 py-2 text-brand-maroon font-bold bg-[#FBF1F3] px-3 rounded-lg"
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
