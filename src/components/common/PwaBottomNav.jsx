import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function PwaBottomNav() {
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414] border-t border-neutral-800 px-2 py-1.5 shadow-2xl flex items-center justify-around text-[10px]">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-gold font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/category/suits"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-gold font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-gold font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span>Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-3 bg-brand-gold text-neutral-900 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </NavLink>

      <button
        onClick={openCart}
        className="relative flex flex-col items-center py-1 px-3 text-neutral-400 hover:text-white transition-colors"
      >
        <ShoppingBag className="w-5 h-5 mb-0.5 text-brand-maroon-light" />
        <span>Cart</span>
        {totalItems > 0 && (
          <span className="absolute top-0 right-3 bg-brand-maroon text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <NavLink
        to={isAuthenticated ? '/account' : '/login'}
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-gold font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>{isAuthenticated ? 'Profile' : 'Sign In'}</span>
      </NavLink>
    </div>
  );
}
