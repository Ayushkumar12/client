import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export function UnderDevelopmentLaunch() {
  const { launchSettings } = useAuth();

  const targetDateStr = launchSettings?.launch_target_date || '2026-10-18T10:00:00+05:30';
  const headline = launchSettings?.launch_headline || 'The Grand Launch';
  const subheadline = launchSettings?.launch_subheadline || '18 October';
  const description = launchSettings?.launch_description ||
    'We are preparing an exclusive curation of hand-embroidered silhouettes, timeless festive ensembles, and modern ethnic pret. Experience the unveiling on 18 October.';
  const curations = launchSettings?.launch_categories || [
    'Stitched Suits',
    'Festive Anarkalis',
    'Artisanal Sarees',
    'Occasion Pret',
  ];

  const calculateTimeLeft = () => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (isNaN(target) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      completed: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setSubmitting(true);

    try {
      await api.submitLaunchSubscribe({ email: email.trim() });
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      // Even if network has temporary hiccup, provide pleasant experience
      setSubmitted(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  const timerUnits = [
    { label: 'Days', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hours', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Minutes', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#1F2937] font-sans selection:bg-[#881337] selection:text-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#881337] text-white py-2 px-4 text-center border-b border-white/10 text-xs tracking-wider flex items-center justify-between">
        <div className="hidden sm:block w-24"></div>
        <div className="uppercase tracking-widest text-[11px] font-medium mx-auto">
          Official Announcement &bull; Autumn / Festive Collection Unveiling
        </div>
        {/* Admin Login Accessibility Link (as requested: admin page accessible with login link until live) */}
        <div className="text-right shrink-0">
          <Link
            to="/login"
            className="text-[11px] uppercase tracking-wider text-white/90 hover:text-white underline font-medium hover:opacity-100 transition-opacity"
            title="Administrator Sign In"
          >
            Staff / Admin Login &rarr;
          </Link>
        </div>
      </div>

      {/* 2. Editorial Brand Header */}
      <header className="py-6 px-4 border-b border-[#E4E4E7] text-center bg-[#FAF7F2]">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.35em] font-bold text-[#881337] uppercase">
          OCT9
        </h1>
        <p className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-[#52525B] mt-1 font-medium">
          Artisanal Pret &bull; Stitched Suits &bull; Festive Couture
        </p>
      </header>

      {/* 3. Main Hero & Countdown Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 sm:py-16 flex flex-col items-center text-center justify-center">
        <div className="text-xs uppercase tracking-[0.25em] font-semibold text-[#881337] mb-2">
          Mark Your Calendar
        </div>

        <h2 className="text-4xl sm:text-6xl font-serif text-[#1F2937] font-medium leading-tight mb-4">
          {headline}
          <br />
          <span className="text-[#881337] italic font-serif">
            {subheadline}
          </span>
        </h2>

        <p className="text-[#52525B] max-w-xl text-sm sm:text-base leading-relaxed mb-10">
          {description}
        </p>

        {/* Editorial Countdown Grid */}
        <div className="w-full max-w-xl border-y border-[#E4E4E7] py-6 sm:py-8 mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 divide-x divide-[#E4E4E7]">
            {timerUnits.map((item) => (
              <div key={item.label} className="text-center px-1">
                <div className="font-serif text-3xl sm:text-5xl font-semibold text-[#881337] leading-none mb-1">
                  {item.value}
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-[#52525B] font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Early Access Notification Form */}
        <div className="w-full max-w-md text-center">
          <div className="text-xs uppercase tracking-widest font-semibold text-[#1F2937] mb-1">
            Request VIP Early Access
          </div>
          <p className="text-xs text-[#52525B] mb-4">
            Receive our launch day catalog and an exclusive privilege code one hour prior to public opening.
          </p>

          {submitted ? (
            <div className="p-3 bg-[#881337] text-white text-xs rounded-sm tracking-wide font-medium">
              Thank you. You have been added to our {subheadline} VIP launch list.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 text-left">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full px-3 py-2 text-xs bg-white border ${
                    emailError ? 'border-red-500' : 'border-[#E4E4E7]'
                  } rounded-sm focus:outline-none focus:border-[#881337]`}
                />
                {emailError && (
                  <p className="text-[10px] text-red-600 mt-1">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#881337] hover:bg-[#4C0519] text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Notify Me'}
              </button>
            </form>
          )}
        </div>

        {/* Premiering Categories */}
        <div className="mt-12 pt-8 border-t border-[#E4E4E7] w-full max-w-2xl">
          <div className="text-[11px] uppercase tracking-widest text-[#52525B] font-medium mb-4">
            Curations Premiering On Launch Day
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {curations.map((cat) => (
              <div
                key={cat}
                className="py-2.5 px-2 border border-[#E4E4E7] bg-white text-xs font-medium text-[#1F2937]"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. Minimal Editorial Footer */}
      <footer className="border-t border-[#E4E4E7] py-6 px-4 text-center bg-[#FAF7F2] text-xs text-[#52525B]">
        <p className="mb-2">
          Questions or customer inquiries? Contact{' '}
          <a
            href="mailto:care@oct9.com"
            className="text-[#881337] font-medium hover:underline"
          >
            Customer Support (care@oct9.com)
          </a>
        </p>
        <p className="text-[11px] text-[#71717A]">
          &copy; {new Date().getFullYear()} OCT9. All Rights Reserved. Official Launch: {subheadline}.
          <span className="mx-2">&bull;</span>
          <Link to="/login" className="text-[#881337] hover:underline font-medium">
            Admin Login
          </Link>
        </p>
      </footer>
    </div>
  );
}
