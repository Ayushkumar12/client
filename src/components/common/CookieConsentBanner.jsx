import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, X, Check, Shield } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function CookieConsentBanner() {
  const { getCookieBanner } = useContent();
  const banner = getCookieBanner();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference options
  const [preferences, setPreferences] = useState({
    essential: true, // Always true & disabled
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    if (banner && banner.enabled === false) {
      setIsVisible(false);
      return;
    }
    const storedConsent = localStorage.getItem('oct9_cookie_consent');
    if (!storedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed.preferences) {
          setPreferences({
            essential: true,
            analytics: Boolean(parsed.preferences.analytics),
            marketing: Boolean(parsed.preferences.marketing)
          });
        }
      } catch (e) {}
    }
  }, [banner]);

  if (!isVisible || (banner && banner.enabled === false)) {
    return null;
  }

  const saveConsent = (choice, prefs) => {
    localStorage.setItem(
      'oct9_cookie_consent',
      JSON.stringify({
        choice,
        preferences: prefs,
        timestamp: new Date().toISOString()
      })
    );
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent('all', { essential: true, analytics: true, marketing: true });
  };

  const handleAcceptEssential = () => {
    saveConsent('essential', { essential: true, analytics: false, marketing: false });
  };

  const handleSaveCustomPreferences = () => {
    saveConsent('custom', preferences);
  };

  return (
    <>
      {/* Cookie Banner */}
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
                'We use essential cookies to maintain secure sessions, bag state, and checkout functionality in compliance with India’s Digital Personal Data Protection (DPDP) Act 2023. Optional cookies help us understand traffic and deliver tailored experiences.'}{' '}
              <Link
                to={banner?.policy_url || '/cookie-policy'}
                className="text-neutral-900 underline underline-offset-2 hover:text-[#5A1827] font-medium"
              >
                Learn more in our Cookie Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-500" />
              Preferences
            </button>
            <button
              type="button"
              onClick={handleAcceptEssential}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded transition-colors cursor-pointer"
            >
              {banner?.decline_text || 'Essential Only'}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              {banner?.accept_text || 'Accept All'}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal (Clean Editorial Standard) */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white max-w-lg w-full border border-neutral-200 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 id="cookie-preferences-title" className="font-serif text-lg font-bold text-neutral-900">
                  Cookie & Privacy Preferences
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage your data consents under the DPDP Act 2023.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Categories */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 divide-y divide-neutral-200 text-xs">
              {/* Category 1: Essential */}
              <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">Strictly Necessary Cookies</span>
                    <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      Required
                    </span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Essential for secure account login, order processing, bag persistence, and fraud prevention. These cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 h-4 w-4 accent-neutral-900 cursor-not-allowed opacity-60"
                  aria-label="Strictly Necessary Cookies (always enabled)"
                />
              </div>

              {/* Category 2: Analytics */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">Performance & Analytics</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Allows us to analyze site speed, traffic patterns, and aggregated visitor flows to enhance navigation and catalog performance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-neutral-900 cursor-pointer"
                />
              </div>

              {/* Category 3: Marketing */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">Marketing & Personalization</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Used to measure conversion campaign attribution and tailor seasonal collection recommendations. No private data is ever sold.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-neutral-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPreferences}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CookieConsentBanner;
