import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <SEO title="My Wishlist | OCT9 Luxury Ethnic Wear" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-brand-border">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>

          <Link
            to="/new-arrivals"
            className="text-xs font-semibold text-brand-maroon hover:underline flex items-center space-x-1"
          >
            <span>Explore More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-brand-border mt-8 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-cream text-brand-maroon flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-800">Your Wishlist is Empty</h3>
            <p className="text-xs text-neutral-500">
              Explore our artisanal suits, sarees, and festive wear and save your favorites here.
            </p>
            <Link
              to="/new-arrivals"
              className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-bold rounded-xl shadow"
            >
              Discover New Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-brand-border shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] bg-neutral-100">
                  <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-500 shadow flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.slug}`} className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-brand-maroon">
                      {item.title}
                    </Link>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-base font-bold text-neutral-900">₹{item.price}</span>
                      {item.original_price > item.price && (
                        <span className="text-xs text-neutral-400 line-through">₹{item.original_price}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item, 'M', 'Standard', 1)}
                    className="w-full py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
