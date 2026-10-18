import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';

export function CookiePolicyPage() {
  const { getPageContent, getBrand, getBusinessDetails } = useContent();
  const page = getPageContent('cookie');
  const brand = getBrand();
  const business = getBusinessDetails();

  const sections = page.sections || [];

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Cookie Policy'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Learn how OCT9 uses cookies and local storage to deliver our services.'}
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        <div className="border-b border-neutral-200 pb-8 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            {page.badge || 'Transparency & Compliance'}
          </p>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-neutral-900">
            {page.title || 'Cookie Policy'}
          </h1>
          <p className="text-sm text-neutral-600">
            {page.subtitle || 'Learn how we use essential cookies and web storage to provide our e-commerce services.'}
          </p>
          {page.last_updated && (
            <p className="text-xs text-neutral-400 pt-1">Last updated: {page.last_updated}</p>
          )}
        </div>

        <div className="divide-y divide-neutral-200 space-y-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="pt-8 first:pt-0 space-y-2">
              <h2 className="font-sans text-base sm:text-lg font-bold text-neutral-900">{sec.title}</h2>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </div>

        {business?.legal_name && (
          <div className="pt-6 border-t border-neutral-200 text-xs text-neutral-500 space-y-1">
            <p className="font-medium text-neutral-800">Entity Details</p>
            <p>{business.legal_name} {business.gstin ? `| GSTIN: ${business.gstin}` : ''}</p>
            {business.registered_address && <p>{business.registered_address}</p>}
            {business.grievance_email && <p>Support & Privacy: {business.grievance_email}</p>}
          </div>
        )}

        <div className="pt-8 border-t border-neutral-200 flex items-center justify-between">
          <Link to="/" className="inline-block text-xs font-semibold text-neutral-900 hover:text-brand-maroon uppercase tracking-wider">
            ← Return to Homepage
          </Link>
          <Link to="/privacy-policy" className="inline-block text-xs font-semibold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
export default CookiePolicyPage;
