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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-2 py-1 shadow-lg flex items-center justify-around text-[10px] font-sans">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-maroon font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`
        }
      >
        <Home className="w-4.5 h-4.5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/category/stitched-suits"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-maroon font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`
        }
      >
        <Compass className="w-4.5 h-4.5 mb-0.5" />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-maroon font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`
        }
      >
        <Heart className="w-4.5 h-4.5 mb-0.5" />
        <span>Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-3 bg-brand-maroon text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-maroon font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`
        }
      >
        <ShoppingBag className="w-4.5 h-4.5 mb-0.5 text-brand-maroon" />
        <span>Cart</span>
        {totalItems > 0 && (
          <span className="absolute top-0 right-3 bg-brand-maroon text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/account' : '/login'}
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 transition-colors ${
            isActive ? 'text-brand-maroon font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`
        }
      >
        <User className="w-4.5 h-4.5 mb-0.5" />
        <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </div>
  );
}
