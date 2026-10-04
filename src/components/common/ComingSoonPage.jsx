import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  Bell,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Truck,
  Award
} from 'lucide-react';
import { SEO } from './SEO.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export function ComingSoonPage({ categorySlug, pageInfo }) {
  const { getJharokhaCategories, getPageAvailability } = useContent();
  const info = pageInfo || getPageAvailability(categorySlug);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 45, seconds: 30 });

  const categoryTitle = info?.title || categorySlug?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Collection';
  const teaser = info?.teaser || 'Our master artisans are handcrafting this exclusive royal collection with timeless heritage drapes.';
  const launchDate = info?.launch_date;

  // Countdown timer logic
  useEffect(() => {
    if (!launchDate) {
      // Default countdown ticker simulation
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }

    const target = new Date(launchDate).getTime();
    if (isNaN(target)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (emailOrPhone.trim()) {
      setSubscribed(true);
      setEmailOrPhone('');
    }
  };

  const activeCategories = getJharokhaCategories().filter(c => c.slug !== categorySlug);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#FAF7F2] via-[#FDFBF7] to-[#FAF7F2] text-neutral-900 py-12 sm:py-20 px-4 relative overflow-hidden">
      <SEO
        title={`${categoryTitle} - Launching Soon | OCT9 Luxury Ethnic Wear`}
        description={teaser}
      />

      {/* Background Royal Ambient Ornaments */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        {/* Top Breadcrumb & Status Pill */}
        <div className="flex items-center justify-center space-x-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-brand-maroon transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Boutique</span>
          </Link>
          <span className="text-neutral-300">•</span>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
              Atelier Preview • Launching Soon
            </span>
          </div>
        </div>

        {/* Hero Arch Crest & Headings */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-maroon to-[#8B263E] p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-amber-300/40 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-200" />
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
            {categoryTitle}
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-brand-maroon font-medium">
            Handcrafted with patience. Reserved for the grandest celebrations.
          </p>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
            {teaser}
          </p>
        </div>

        {/* Countdown Timer Canvas */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-amber-200/80 p-6 sm:p-8 max-w-xl mx-auto shadow-lg shadow-amber-950/5">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-4">
            {launchDate ? `Official Launch: ${new Date(launchDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Estimated Collection Unveiling'}
          </span>

          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#FAF7F2] rounded-2xl p-3 sm:p-4 border border-amber-100">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Days</span>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-3 sm:p-4 border border-amber-100">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Hours</span>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-3 sm:p-4 border border-amber-100">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Mins</span>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-3 sm:p-4 border border-amber-100">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-brand-maroon block">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Secs</span>
            </div>
          </div>
        </div>

        {/* VIP Early Access & Notification Box */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
              Get VIP Early Access & ₹500 Launch Voucher
            </h3>
            <p className="text-xs text-neutral-500">
              Be the first to browse and shop before the official public release.
            </p>
          </div>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-800 flex items-center justify-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">
                You're on the VIP VIP List! We will notify you the moment {categoryTitle} goes live.
              </span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Enter email or WhatsApp number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-white text-neutral-900 placeholder-neutral-400 text-xs px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon shadow-2xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify Me</span>
              </button>
            </form>
          )}
        </div>

        {/* Explore Live Collections in the Meantime */}
        {activeCategories.length > 0 && (
          <div className="pt-10 border-t border-neutral-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                In The Meantime
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
                Explore Available Collections
              </h2>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {activeCategories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={cat.link || `/category/${cat.slug}`}
                  className="group flex flex-col items-center space-y-2 p-2 rounded-2xl hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-amber-200/80"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-300/70 p-0.5 shadow-sm group-hover:scale-108 transition-transform duration-500">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-brand-maroon transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.14em] px-6 py-3 rounded-full transition-all duration-300 shadow-md"
              >
                <span>Return to Boutique Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
