/**
 * Product URL Encoder & Decoder Utility
 * Encodes product slug/id into URL-safe obfuscated tokens so readable product names
 * are not exposed in the browser address bar.
 */

// Helper to encode string to base64url
export function encodeProductSlug(productOrSlug) {
  if (!productOrSlug) return '';
  const raw = typeof productOrSlug === 'object'
    ? (productOrSlug.slug || String(productOrSlug.id || ''))
    : String(productOrSlug);

  try {
    // URL-safe base64 encoding without padding
    const encoded = btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return encoded;
  } catch (e) {
    return raw;
  }
}

// Helper to decode base64url back to original slug or ID
export function decodeProductSlug(token) {
  if (!token) return '';
  try {
    // If it's already a regular slug with hyphens or numeric, return if not base64
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = decodeURIComponent(escape(atob(base64)));
    if (decoded && decoded.trim().length > 0 && /^[\w\d\-_]+$/.test(decoded)) {
      return decoded;
    }
    return token;
  } catch (e) {
    return token;
  }
}

// Get the full URL path for a product
export function getProductUrl(product) {
  if (!product) return '/category/all';
  const encoded = encodeProductSlug(product);
  return `/product/${encoded}`;
}
