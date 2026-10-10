import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function WishlistPage() {
  const { wishlist } = useWishlist();

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
          <div className="bg-white rounded-sm p-12 text-center border border-neutral-200 mt-8 space-y-4 max-w-lg mx-auto shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-brand-maroon flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-800">Your Wishlist is Empty</h3>
            <p className="text-xs text-neutral-500">
              Explore our artisanal suits, sarees, and festive wear and save your favorites here.
            </p>
            <Link
              to="/new-arrivals"
              className="inline-block px-6 py-2.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-2xs"
            >
              Discover New Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8">
            {wishlist.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
