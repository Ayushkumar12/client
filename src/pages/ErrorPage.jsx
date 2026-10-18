import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Home, Mail, AlertCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';

export function ErrorPage({ error = null, errorInfo = null, resetError = null }) {
  const location = useLocation();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract error message from props, location state, or URL params
  const searchParams = new URLSearchParams(location?.search || '');
  const urlMessage = searchParams.get('message');
  const errorCode = searchParams.get('code') || '500';

  const displayMessage = error?.message || location?.state?.message || urlMessage ||
    'An unexpected technical interruption occurred while processing your request.';

  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleCopyDetails = () => {
    const report = [
      `OCT9 Error Report`,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `Message: ${displayMessage}`,
      error?.stack ? `Stack: ${error.stack}` : '',
      errorInfo?.componentStack ? `Component Stack: ${errorInfo.componentStack}` : ''
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <SEO
        title="System Error | OCT9"
        description="We are experiencing a temporary technical interruption. Please reload or contact customer support."
        noindex={true}
      />

      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#FAF7F2] px-4 py-16 sm:py-24">
        <div className="max-w-xl w-full text-center space-y-7">
          {/* Subtle Icon & Status Tag */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 text-neutral-800 bg-white shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-semibold block">
                Error {errorCode} • System Notice
              </span>
            </div>
          </div>

          {/* Heading & Context */}
          <div className="space-y-3">
            <h1 className="font-sans text-3xl sm:text-4xl text-neutral-900 tracking-tight font-normal">
              Something Went Wrong
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              We encountered an unexpected technical interruption. Our team has been alerted, and we are working to resolve it promptly.
            </p>
          </div>

          {/* Editorial divider */}
          <div className="border-b border-neutral-300 w-24 mx-auto" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleReload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 border border-neutral-300 bg-white text-neutral-800 text-xs uppercase tracking-widest font-medium hover:bg-neutral-100 transition-colors shadow-2xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>

          {/* Optional Technical Details Disclosure */}
          {(error || errorInfo || urlMessage) && (
            <div className="pt-2 text-left">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="mx-auto flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-4 cursor-pointer"
              >
                <span>{showTechnicalDetails ? 'Hide Technical Details' : 'View Technical Details'}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showTechnicalDetails && (
                <div className="mt-3 p-4 bg-white border border-neutral-200 text-neutral-700 text-xs font-mono rounded-sm shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="font-bold text-[10px] uppercase text-neutral-500">Error Details</span>
                    <button
                      type="button"
                      onClick={handleCopyDetails}
                      className="inline-flex items-center space-x-1 text-[11px] text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-red-700 font-semibold break-all">{displayMessage}</p>
                  {error?.stack && (
                    <pre className="text-[10px] text-neutral-500 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help & Support Footer */}
          <div className="pt-6 border-t border-neutral-200 text-xs text-neutral-500 space-y-2">
            <p>
              Need immediate assistance? Our support team is ready to help.
            </p>
            <div className="flex items-center justify-center space-x-4 text-neutral-800 font-medium">
              <Link to="/contact" className="hover:underline">
                Contact Us
              </Link>
              <span>•</span>
              <a href="mailto:support@oct9.in" className="hover:underline inline-flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>support@oct9.in</span>
              </a>
              <span>•</span>
              <Link to="/faq" className="hover:underline">
                Help &amp; FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
