import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';

export function CookieConsentBanner() {
  const { getCookieBanner } = useContent();
  const banner = getCookieBanner();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If disabled by admin, don't show
    if (banner && banner.enabled === false) {
      setIsVisible(false);
      return;
    }
    const consent = localStorage.getItem('oct9_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, [banner]);

  if (!isVisible || (banner && banner.enabled === false)) {
    return null;
  }

  const handleAcceptAll = () => {
    localStorage.setItem('oct9_cookie_consent', JSON.stringify({ choice: 'all', timestamp: new Date().toISOString() }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('oct9_cookie_consent', JSON.stringify({ choice: 'essential', timestamp: new Date().toISOString() }));
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
            {banner?.title || 'Cookie Notice & Privacy Preferences'}
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {banner?.message ||
              'We use essential cookies and secure local storage to keep you signed in, remember your shopping bag, and maintain site functionality in accordance with India’s Digital Personal Data Protection Act 2023.'}{' '}
            <Link
              to={banner?.policy_url || '/cookie-policy'}
              className="text-neutral-900 underline underline-offset-2 hover:text-brand-maroon font-medium"
            >
              Learn more in our Cookie Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded transition-colors"
          >
            {banner?.decline_text || 'Essential Only'}
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors"
          >
            {banner?.accept_text || 'Accept All'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
