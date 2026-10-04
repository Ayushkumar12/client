import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Tag, RotateCcw, MapPin } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function TopAnnouncementBar() {
  const { getBrand } = useContent();
  const brand = getBrand();

  return (
    <div className="bg-[#FAF7F2] text-neutral-700 text-[11px] py-1.5 px-4 border-b border-neutral-200/80 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Announcements */}
        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
            <span>
              {brand.announcement_bar || '✨ Free Shipping on orders above ₹1,999 • Handcrafted with Love'}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 whitespace-nowrap">
            <Tag className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
            <span>15% Off on Prepaid Orders | Use Code: <strong className="text-white bg-brand-maroon px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">OCT15</strong></span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
            <span>7 Days Easy Returns</span>
          </div>
        </div>

        {/* Right Quick Links & Social */}
        <div className="flex items-center space-x-5 text-[11px] ml-auto">
          <Link
            to="/track-order"
            className="flex items-center space-x-1.5 text-brand-maroon hover:text-brand-maroon-hover font-bold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Track Order</span>
          </Link>

          <div className="h-3 w-[1px] bg-neutral-300 hidden sm:block"></div>

          <div className="flex items-center space-x-3 text-neutral-400">
            {brand.instagram_url && (
              <a href={brand.instagram_url} target="_blank" rel="noreferrer" className="hover:text-brand-maroon transition-colors" aria-label="Instagram">
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {brand.facebook_url && (
              <a href={brand.facebook_url} target="_blank" rel="noreferrer" className="hover:text-brand-maroon transition-colors" aria-label="Facebook">
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
