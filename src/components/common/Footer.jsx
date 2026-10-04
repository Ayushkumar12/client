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

const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    desc: 'On all orders above ₹1,999 across India',
    tag: 'Express 48H'
  },
  {
    icon: RotateCcw,
    title: '7 Days Easy Return',
    desc: 'Hassle-free doorstep pickup via Shiprocket',
    tag: 'Doorstep Pickup'
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Payments',
    desc: 'Encrypted checkout powered by Razorpay',
    tag: '256-Bit SSL'
  },
  {
    icon: Sparkles,
    title: 'Handcrafted Luxury',
    desc: 'Artisanal weaves & bespoke embroidery',
    tag: 'Master Artisans'
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
        {/* Top Trust Badges Strip (Modern Luxury Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-12 border-b border-neutral-200/80">
          {TRUST_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="group relative bg-gradient-to-b from-white via-[#FAF7F2]/60 to-[#F5EFE6]/30 hover:from-white hover:to-white border border-neutral-200/80 hover:border-brand-maroon/30 rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(114,24,37,0.12)] overflow-hidden cursor-default"
              >
                {/* Subtle top ambient glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-maroon/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Modern Icon Emblem */}
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-brand-maroon/5 border border-brand-maroon/10 text-brand-maroon flex items-center justify-center shadow-xs group-hover:bg-brand-maroon group-hover:text-[#F6D389] group-hover:scale-110 group-hover:rotate-2 transition-all duration-300">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-maroon border border-brand-gold/30 opacity-90 group-hover:bg-[#F6D389] group-hover:text-brand-maroon transition-colors">
                    {badge.tag}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-sm sm:text-base text-neutral-900 group-hover:text-brand-maroon transition-colors duration-200 tracking-tight mb-1">
                  {badge.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-[210px]">
                  {badge.desc}
                </p>
              </div>
            );
          })}
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
