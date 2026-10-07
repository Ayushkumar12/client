import React from 'react';
import { Helmet } from 'react-helmet-async';

export function SEO({
  title = 'OCT9 - Women\'s Ethnic Wear, Suits & Sarees',
  description = 'Shop women\'s ethnic wear, designer suits, anarkalis, and sarees at OCT9. Fast shipping across India with secure payment options.',
  keywords = 'OCT9, ethnic wear, suits, designer suits, salwar suits, anarkali suits, sarees, festive wear, indian fashion',
  canonicalUrl,
  image = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  type = 'website',
  schemaData = null,
}) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://oct9.com';
  const fullCanonical = canonicalUrl ? `${siteUrl}${canonicalUrl}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);

  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'FashionStore',
    'name': 'OCT9 Fashion Store',
    'url': siteUrl,
    'logo': `${siteUrl}/oct9-logo.jpg`,
    'description': description,
    'priceRange': '₹₹',
    'paymentAccepted': 'Razorpay, Credit Card, Debit Card, UPI, NetBanking, Cash on Delivery',
    'currenciesAccepted': 'INR',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Plot 42, Luxury Fashion Hub, Okhla Phase-III',
      'addressLocality': 'New Delhi',
      'addressRegion': 'Delhi',
      'postalCode': '110001',
      'addressCountry': 'IN'
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data (JSON-LD Schema) for Google SEO Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData || defaultOrgSchema)}
      </script>
    </Helmet>
  );
}
