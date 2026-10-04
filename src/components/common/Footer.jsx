import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const BRAND_PILLARS = [
  {
    id: 1,
    title: 'Artisan Made',
    desc: 'Handcrafted heritage & bespoke embroidery',
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Needle */}
        <path d="M38 8L18 28" />
        <path d="M38 8C39.5 6.5 42 7 43 8C44 9 44.5 11.5 43 13L36 20" />
        <circle cx="39.5" cy="9.5" r="1" fill="currentColor" />
        {/* Elegant flowing thread loop */}
        <path d="M18 28C13 33 9 36 7 33C5 30 9 25 15 23C22 21 24 26 21 31C18 36 11 41 7 43" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Weekly Launches',
    desc: 'Curated festive edits & fresh designer drops',
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Box */}
        <path d="M24 7L38 14.5V29.5L24 37L10 29.5V14.5L24 7Z" />
        <path d="M24 7V22M38 14.5L24 22L10 14.5" />
        <path d="M24 22V37" />
        {/* Radiance spark rays */}
        <path d="M24 2V4M41 9.5L39.5 11M7 9.5L8.5 11M44 22H42M4 22H6" />
        {/* Gentle caring hand outline */}
        <path d="M8 38C12 37 18 36 24 39.5L35 36C37 35.3 39 37 37.5 39L33 43C30 45 22 45 16 43L8 41V38Z" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Premium Fabrics',
    desc: 'Pure silks, fine chanderi & royal weaves',
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Luxury Diamond */}
        <path d="M12 16L24 6L36 16L24 42L12 16Z" />
        <path d="M12 16H36" />
        <path d="M17 16L24 42L31 16" />
        <path d="M20 6L17 16M28 6L31 16" />
        {/* Sparkles */}
        <path d="M38 8L39 11L42 12L39 13L38 16L37 13L34 12L37 11L38 8Z" fill="currentColor" stroke="none" />
        <path d="M9 32L10 34.5L12.5 35.5L10 36.5L9 39L8 36.5L5.5 35.5L8 34.5L9 32Z" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Quality Stitching',
    desc: 'Master craftsmanship & precision tailoring',
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Sewing machine */}
        <path d="M6 38H42" />
        <path d="M8 38V16C8 13.8 9.8 12 12 12H32C34.2 12 36 13.8 36 16V38" />
        <path d="M36 21H22C19.8 21 18 22.8 18 25V30C18 32.2 19.8 34 22 34H36" />
        <path d="M14 24V32" />
        <circle cx="36" cy="22" r="3.5" />
        <path d="M22 8V12M26 8V12" />
      </svg>
    )
  }
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-white text-neutral-700 border-t border-neutral-200/80 pt-12 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimalist Haute-Couture Brand Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pb-12 border-b border-neutral-200/70">
          {BRAND_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:bg-[#FAF7F2]/50 cursor-default"
            >
              {/* Minimal Line Icon Container with Brand Hover Delight */}
              <div className="mb-3 text-neutral-800 group-hover:text-brand-maroon transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center">
                {pillar.icon}
              </div>

              {/* Title */}
              <h4 className="font-serif font-bold text-sm sm:text-base text-neutral-900 group-hover:text-brand-maroon transition-colors tracking-wide mb-1">
                {pillar.title}
              </h4>

              {/* Refined Subtitle */}
              <p className="text-xs text-neutral-500 font-sans leading-relaxed max-w-[200px]">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/oct9-logo.jpg" alt="OCT9 - Luxury Without Noise" className="h-10 sm:h-11 w-auto rounded-lg object-contain border border-neutral-200 shadow-2xs transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.2em] text-neutral-900">
                  OCT<span className="text-brand-maroon">9</span>
                </span>
                <span className="text-[8px] tracking-[0.25em] uppercase text-neutral-500 font-medium">
                  Luxury Without Noise
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-600 leading-relaxed pr-6">
              OCT9 celebrates the eternal beauty of Indian ethnic craftsmanship. From imperial Anarkalis and Zardozi suits to handloom Kanjivaram sarees and bespoke juttis, each creation is tailored to perfection for the modern royalty in you.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-brand-maroon flex items-center justify-center text-neutral-700 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-brand-maroon flex items-center justify-center text-neutral-700 hover:text-white transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-brand-maroon flex items-center justify-center text-neutral-700 hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold text-neutral-900 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/new-arrivals" className="text-neutral-600 hover:text-brand-maroon transition-colors">New Arrivals</Link></li>
              <li><Link to="/category/suits" className="text-neutral-600 hover:text-brand-maroon transition-colors">Suits & Salwars</Link></li>
              <li><Link to="/category/designer-suits" className="text-neutral-600 hover:text-brand-maroon transition-colors">Designer Suits</Link></li>
              <li><Link to="/category/festive-wear" className="text-neutral-600 hover:text-brand-maroon transition-colors">Festive Wear</Link></li>
              <li><Link to="/category/party-wear" className="text-neutral-600 hover:text-brand-maroon transition-colors">Party Wear</Link></li>
              <li><Link to="/category/sarees" className="text-neutral-600 hover:text-brand-maroon transition-colors">Designer Sarees</Link></li>
              <li><Link to="/category/accessories" className="text-neutral-600 hover:text-brand-maroon transition-colors">Accessories & Juttis</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold text-neutral-900 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/track-order" className="text-brand-maroon font-bold hover:underline">Track Shiprocket Order</Link></li>
              <li><Link to="/contact" className="text-neutral-600 hover:text-brand-maroon transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="text-neutral-600 hover:text-brand-maroon transition-colors">Shipping Policy (Shiprocket)</Link></li>
              <li><Link to="/returns" className="text-neutral-600 hover:text-brand-maroon transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="text-neutral-600 hover:text-brand-maroon transition-colors">Size Guide & Tailoring</Link></li>
              <li><Link to="/faq" className="text-neutral-600 hover:text-brand-maroon transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter & App Download */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-bold text-neutral-900 uppercase tracking-wider">Stay In Touch</h4>
            <p className="text-xs text-neutral-500">Subscribe for secret sales, festive drops and ₹500 off on your first order.</p>

            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#FAF7F2] text-neutral-900 placeholder-neutral-400 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:border-brand-maroon shadow-2xs font-medium"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#5A1827] hover:bg-[#43121D] text-white p-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center space-x-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Thank you for subscribing to OCT9!</span>
              </p>
            )}

            {/* App Store Download Badges */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-neutral-500 block mb-2 uppercase tracking-wider">
                Download Our App
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center space-x-2 bg-[#FAF7F2] hover:bg-neutral-100 border border-neutral-200/90 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs">
                  <Smartphone className="w-4 h-4 text-brand-maroon" />
                  <div className="text-[9px] leading-tight">
                    <span className="text-neutral-500 block">Download on</span>
                    <span className="text-neutral-900 font-bold">App Store</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-[#FAF7F2] hover:bg-neutral-100 border border-neutral-200/90 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div className="text-[9px] leading-tight">
                    <span className="text-neutral-500 block">Get it on</span>
                    <span className="text-neutral-900 font-bold">Google Play</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 OCT9. All Rights Reserved. | <span className="text-brand-maroon font-semibold">Tradition • Craftsmanship • Elegance</span>
          </div>

          {/* Payment Gateways / Logos Strip */}
          <div className="flex items-center space-x-2.5 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">100% Secure Payments:</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">Razorpay</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">UPI</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">Visa</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">Mastercard</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">RuPay</span>
            <span className="bg-[#FAF7F2] border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">Shiprocket COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
