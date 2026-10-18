import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent, DEFAULT_SEO_CONFIG } from '../../context/ContentContext.jsx';

export function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  image,
  type = 'website',
  schemaData = null,
  noindex = false,
  pageKey = null
}) {
  const { content } = useContent();
  const seoConfig = content?.seo || DEFAULT_SEO_CONFIG;
  const aeo = seoConfig.aeo || DEFAULT_SEO_CONFIG.aeo;
  const geo = seoConfig.geo || DEFAULT_SEO_CONFIG.geo;
  const pageOverrides = seoConfig.page_overrides || DEFAULT_SEO_CONFIG.page_overrides;

  // Auto-detect page override by key or by current path
  let activeOverride = null;
  if (pageKey && pageOverrides[pageKey]) {
    activeOverride = pageOverrides[pageKey];
  } else if (typeof window !== 'undefined' && pageOverrides) {
    const currentPath = window.location.pathname.toLowerCase();
    const found = Object.values(pageOverrides).find(
      (o) => o.path && (o.path.toLowerCase() === currentPath || (currentPath === '' && o.path === '/'))
    );
    if (found) activeOverride = found;
  }

  // Resolved values
  const DEFAULT_META_DESC = "Shop authentic women's luxury ethnic wear, designer suits, anarkalis, and festive sarees at OCT9. Handcrafted silhouettes, pure mulberry silk, and complimentary pan-India shipping.";
  const finalTitle = title || activeOverride?.title || seoConfig.meta_title || DEFAULT_SEO_CONFIG.meta_title;
  
  const rawDescription = description || activeOverride?.description || seoConfig.meta_description;
  const finalDescription = (rawDescription && rawDescription.trim().length >= 25 && rawDescription.trim() !== 'Luxury without noise')
    ? rawDescription.trim()
    : DEFAULT_META_DESC;

  const finalKeywords = keywords || seoConfig.keywords || DEFAULT_SEO_CONFIG.keywords;
  const rawImage = image || seoConfig.og_image || DEFAULT_SEO_CONFIG.og_image || '/oct9-logo.jpg';
  const siteUrl = seoConfig.canonical_base_url || (typeof window !== 'undefined' && window.location.origin.includes('oct9.in')
    ? window.location.origin
    : 'https://oct9.in');

  const finalImage = rawImage.startsWith('http')
    ? rawImage
    : `${siteUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  const finalNoindex = noindex || activeOverride?.noindex || false;

  const fullCanonical = canonicalUrl
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${siteUrl}${canonicalUrl}`)
    : (typeof window !== 'undefined' ? `${siteUrl}${window.location.pathname}` : siteUrl);

  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': geo.business_type || 'FashionStore',
    'name': geo.store_name || seoConfig.site_name || 'OCT9 Luxury Ethnic Wear',
    'url': siteUrl,
    'logo': `${siteUrl}/oct9-logo.jpg`,
    'image': finalImage,
    'description': aeo.brand_summary || finalDescription,
    'priceRange': aeo.price_range || '₹₹',
    'paymentAccepted': geo.payment_accepted || 'Razorpay, Credit Card, Debit Card, UPI, NetBanking, Cash on Delivery',
    'currenciesAccepted': geo.currencies_accepted || 'INR',
    'telephone': geo.telephone || '+91 9667100863',
    'email': geo.email || 'support@oct9.in',
    'openingHours': geo.opening_hours || 'Mo-Sa 10:00-19:00',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': geo.street_address || 'Plot 42, Luxury Fashion Hub, Okhla Phase-III',
      'addressLocality': geo.city || 'New Delhi',
      'addressRegion': geo.geo_region || 'Delhi',
      'postalCode': geo.postal_code || '110001',
      'addressCountry': geo.country_code || 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': geo.latitude || '28.5535',
      'longitude': geo.longitude || '77.2066'
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'India'
    },
    'knowsAbout': aeo.primary_entities ? aeo.primary_entities.split(',').map((s) => s.trim()) : []
  };

  const defaultRobotsDirective = seoConfig.robots_default && seoConfig.robots_default !== 'noindex, nofollow'
    ? seoConfig.robots_default
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Robots Directive: If noindex is requested, set noindex */}
      {finalNoindex ? (
        <>
          <meta name="robots" content="noindex, follow" />
          <meta name="googlebot" content="noindex, follow" />
        </>
      ) : (
        <>
          <meta name="robots" content={defaultRobotsDirective} />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}

      {/* Geographic & Local Search Meta Tags (GEO) */}
      <meta name="geo.region" content={geo.geo_region || 'IN-DL'} />
      <meta name="geo.placename" content={geo.geo_placename || 'New Delhi'} />
      <meta name="geo.position" content={geo.geo_position || `${geo.latitude || '28.5535'};${geo.longitude || '77.2066'}`} />
      <meta name="ICBM" content={geo.icbm || `${geo.latitude || '28.5535'}, ${geo.longitude || '77.2066'}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={seoConfig.site_name || 'OCT9 Luxury Ethnic Wear'} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta property="twitter:card" content={seoConfig.twitter_card || 'summary_large_image'} />
      <meta property="twitter:site" content={seoConfig.twitter_site || '@oct9india'} />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />

      {/* Structured Data (JSON-LD Schema) for Google SEO & Answer Engines (AEO) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData || defaultOrgSchema)}
      </script>
    </Helmet>
  );
}

export default SEO;
