import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO.jsx';
import { ExternalLink, Compass } from 'lucide-react';

export function SitemapPage() {
  const categories = [
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Stitched Suits', path: '/category/stitched-suits' },
    { name: 'Unstitched Suits', path: '/category/unstitched-suits' },
    { name: 'Designer Suits', path: '/category/designer-suits' },
    { name: 'Sarees', path: '/category/sarees' },
    { name: 'Festive Wear', path: '/category/festive-wear' },
    { name: 'Party Wear', path: '/category/party-wear' },
    { name: 'Royal Jewels & Zewar', path: '/category/accessories' },
    { name: 'Punjabi Juttis', path: '/category/jutti' },
  ];

  const customerCare = [
    { name: 'Contact Us', path: '/contact' },
    { name: 'Shipping & Delivery Policy', path: '/shipping-policy' },
    { name: 'Returns & Exchanges', path: '/returns' },
    { name: 'Size Guide & Measurements', path: '/size-guide' },
    { name: 'Frequently Asked Questions (FAQ)', path: '/faq' },
    { name: 'Track Order', path: '/track-order' },
  ];

  const legalAndCompany = [
    { name: 'About OCT9 Atelier', path: '/about' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Cookie Policy', path: '/cookie-policy' },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Sitemap | OCT9 Luxury Indian Ethnic Wear"
        description="Browse all categories, collections, customer care guides, and legal policies across the OCT9 luxury Indian ethnic wear storefront."
        canonicalUrl="/sitemap"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="border-b border-neutral-300 pb-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            <Compass className="w-4 h-4 text-brand-maroon" />
            <span>Store Navigation &amp; Index</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            OCT9 Site Index &amp; Sitemap
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl font-light leading-relaxed">
            Direct navigation index for search engine crawlers, visitors, and customers to access all product collections, customer care documentation, and statutory policies.
          </p>
        </div>

        {/* Section 1: Product Categories & Silhouettes */}
        <div className="bg-white rounded-sm border border-neutral-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="font-sans text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Collections &amp; Silhouettes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {categories.map((c) => (
              <Link
                key={c.path}
                to={c.path}
                className="p-2.5 rounded-sm hover:bg-[#FAF7F2] text-neutral-800 hover:text-brand-maroon font-medium transition-colors border border-transparent hover:border-neutral-200"
              >
                &bull; {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Section 2: Customer Care & Order Services */}
        <div className="bg-white rounded-sm border border-neutral-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="font-sans text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Customer Care &amp; Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {customerCare.map((c) => (
              <Link
                key={c.path}
                to={c.path}
                className="p-2.5 rounded-sm hover:bg-[#FAF7F2] text-neutral-800 hover:text-brand-maroon font-medium transition-colors border border-transparent hover:border-neutral-200"
              >
                &bull; {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Section 3: Statutory & Legal Policies */}
        <div className="bg-white rounded-sm border border-neutral-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="font-sans text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Company &amp; Statutory Legal Policies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {legalAndCompany.map((c) => (
              <Link
                key={c.path}
                to={c.path}
                className="p-2.5 rounded-sm hover:bg-[#FAF7F2] text-neutral-800 hover:text-brand-maroon font-medium transition-colors border border-transparent hover:border-neutral-200"
              >
                &bull; {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4: Machine-Readable XML Feed */}
        <div className="bg-[#FAF7F2] rounded-sm border border-neutral-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-bold text-neutral-900">Machine-Readable XML Sitemap</h3>
            <p className="text-neutral-500 text-[11px] mt-0.5">
              Official XML feed with canonical URLs, change frequencies, and priorities for Googlebot and search engine crawlers.
            </p>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm text-xs font-semibold shrink-0 cursor-pointer"
          >
            <span>View sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SitemapPage;
