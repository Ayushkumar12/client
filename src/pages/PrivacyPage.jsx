import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';

export function PrivacyPage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('privacy');
  const brand = getBrand();

  const sections = page.sections || [];

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Privacy Policy'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Learn how OCT9 protects your personal information and safeguards customer data.'}
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        <div className="border-b border-neutral-200 pb-8 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            {page.badge || 'Data Protection'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            {page.title || 'Privacy Policy'}
          </h1>
          <p className="text-sm text-neutral-600">
            {page.subtitle || 'Your privacy is paramount. Learn how we safeguard your personal data.'}
          </p>
          {page.last_updated && (
            <p className="text-xs text-neutral-400 pt-1">Last updated: {page.last_updated}</p>
          )}
        </div>

        <div className="divide-y divide-neutral-200 space-y-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="pt-8 first:pt-0 space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">{sec.title}</h2>
              <p className="text-sm text-neutral-700 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-neutral-200">
          <Link to="/" className="inline-block text-xs font-semibold text-neutral-900 hover:text-brand-maroon uppercase tracking-wider">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
