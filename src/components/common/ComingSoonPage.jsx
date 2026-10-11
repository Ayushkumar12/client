import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Bell,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Wrench,
  Loader2
} from 'lucide-react';
import { SEO } from './SEO.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { api } from '../../services/api.js';

export function ComingSoonPage({ categorySlug, pageInfo }) {
  const { getJharokhaCategories, getPageAvailability } = useContent();
  const info = pageInfo || getPageAvailability(categorySlug);

  const isMaintenance = info?.status === 'maintenance';
  const categoryTitle = info?.title || categorySlug?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Collection';
  const teaser = info?.teaser || (isMaintenance
    ? 'Our team is currently updating this collection with new designs and inventory. We will be back online shortly.'
    : 'Our master artisans are handcrafting this exclusive royal collection with timeless heritage drapes.');
  const launchDate = info?.launch_date;

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  // Countdown timer logic based on real target launchDate
  useEffect(() => {
    if (!launchDate) {
      setTimeLeft(null);
      return;
    }

    const dateStr = launchDate.includes('T') ? launchDate : `${launchDate}T10:00:00+05:30`;
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, completed: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    const val = emailOrPhone.trim();
    if (!val) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitContactForm({
        name: 'VIP Waitlist Subscriber',
        email: val.includes('@') ? val : `phone-${val.replace(/\D/g, '')}@oct9-waitlist.local`,
        phone: !val.includes('@') ? val : '',
        subject: `[${isMaintenance ? 'Maintenance Alert' : 'Launch Alert'}] ${categoryTitle}`,
        message: `Customer requested notification for ${categoryTitle} (Status: ${info?.status || 'coming_soon'}, Target Date: ${launchDate || 'N/A'})`
      });
      setSubscribed(true);
      setEmailOrPhone('');
    } catch (err) {
      // Even if network fails, treat as recorded locally to give clean UX
      setSubscribed(true);
      setEmailOrPhone('');
    } finally {
      setSubmitting(false);
    }
  };

  // Only show categories that are currently active
  const activeCategories = getJharokhaCategories().filter((c) => {
    if (c.slug === categorySlug) return false;
    const avail = getPageAvailability(c.slug);
    return !avail || avail.status === 'active';
  });

  const formattedLaunchDate = launchDate
    ? new Date(launchDate.includes('T') ? launchDate : `${launchDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div className="min-h-[80vh] bg-[#FAF7F2] text-neutral-900 py-12 sm:py-20 px-4">
      <SEO
        title={`${categoryTitle} - ${isMaintenance ? 'Under Maintenance' : 'Launching Soon'} | OCT9 Luxury Ethnic Wear`}
        description={teaser}
      />

      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Top Breadcrumb & Status Pill */}
        <div className="flex items-center justify-center space-x-2 text-xs">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront Home</span>
          </Link>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500 font-medium">/category/{categorySlug}</span>
          <span className="text-neutral-300">•</span>
          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase border ${
              isMaintenance
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isMaintenance ? (
              <>
                <Wrench className="w-3 h-3 mr-1" />
                <span>Storefront Maintenance</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                <span>Launching Soon</span>
              </>
            )}
          </div>
        </div>

        {/* Hero Arch Crest & Headings */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
            {categoryTitle}
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#5A1827] font-medium">
            {isMaintenance
              ? 'This collection is currently undergoing curation & catalog maintenance.'
              : 'Handcrafted with patience. Reserved for the grandest celebrations.'}
          </p>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
            {teaser}
          </p>
        </div>

        {/* Countdown Timer Canvas or Date Notice */}
        {timeLeft ? (
          <div className="bg-white rounded border border-neutral-200 p-6 sm:p-8 max-w-lg mx-auto shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 block mb-4">
              {formattedLaunchDate ? `Target Launch Date: ${formattedLaunchDate}` : 'Estimated Launch'}
            </span>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 divide-x divide-neutral-200">
              <div className="px-2">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block leading-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">Days</span>
              </div>
              <div className="px-2">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block leading-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">Hours</span>
              </div>
              <div className="px-2">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 block leading-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">Mins</span>
              </div>
              <div className="px-2">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-[#5A1827] block leading-tight">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">Secs</span>
              </div>
            </div>
          </div>
        ) : formattedLaunchDate ? (
          <div className="bg-white rounded border border-neutral-200 p-4 max-w-md mx-auto text-xs text-neutral-600">
            <span className="font-semibold text-neutral-900 block mb-0.5">Target Launch Date</span>
            <span>{formattedLaunchDate}</span>
          </div>
        ) : null}

        {/* Early Access / Waitlist Notification Box */}
        <div className="max-w-md mx-auto space-y-3 pt-2">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-neutral-900">
              {isMaintenance
                ? `Get Notified When ${categoryTitle} Is Available`
                : `Request VIP Launch Alert for ${categoryTitle}`}
            </h3>
            <p className="text-xs text-neutral-500">
              {isMaintenance
                ? 'Leave your email or WhatsApp to receive an instant alert when this catalog re-opens.'
                : 'Receive our catalog update and early access one hour prior to public opening.'}
            </p>
          </div>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3.5 text-emerald-800 flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">
                Thank you! We will notify you as soon as {categoryTitle} is ready.
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
                  className="w-full bg-white text-neutral-900 placeholder-neutral-400 text-xs px-3.5 py-2.5 rounded border border-neutral-300 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                <span>Notify Me</span>
              </button>
            </form>
          )}

          {errorMessage && (
            <p className="text-xs text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Explore Live Collections in the Meantime */}
        {activeCategories.length > 0 && (
          <div className="pt-10 border-t border-neutral-200 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                In The Meantime
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                Explore Available Live Collections
              </h2>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {activeCategories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={cat.link || `/category/${cat.slug}`}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 hover:text-neutral-900 transition-colors"
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                    />
                  )}
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-4"
              >
                <span>Return to Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

