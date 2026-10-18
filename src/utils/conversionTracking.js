/**
 * Universal E-Commerce Conversion Event Tracking Utility
 * Dispatches standard GA4 / Google Tag Manager dataLayer ecommerce events
 * and Meta Pixel (fbq) events when available.
 */

function ensureDataLayer() {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
}

/**
 * Format a catalog product into standard GA4 item format
 */
export function formatItemForAnalytics(product, quantity = 1, selectedVariant = {}) {
  if (!product) return null;
  return {
    item_id: String(product.id || product.product_id || ''),
    item_name: product.title || '',
    affiliation: 'OCT9 Storefront',
    currency: 'INR',
    discount: product.original_price && product.original_price > product.price
      ? Number((product.original_price - product.price).toFixed(2))
      : 0,
    item_brand: 'OCT9',
    item_category: product.category_slug || product.category || 'Apparel',
    item_variant: [selectedVariant.color, selectedVariant.size].filter(Boolean).join(' / ') || undefined,
    price: Number(product.price) || 0,
    quantity: Math.max(1, Number(quantity) || 1)
  };
}

/**
 * Track Product Detail View
 */
export function trackViewItem(product) {
  if (typeof window === 'undefined' || !product) return;
  ensureDataLayer();

  const item = formatItemForAnalytics(product);
  const eventPayload = {
    event: 'view_item',
    ecommerce: {
      currency: 'INR',
      value: Number(product.price) || 0,
      items: item ? [item] : []
    }
  };

  window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object per GA4 best practice
  window.dataLayer.push(eventPayload);

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: product.title,
      content_ids: [String(product.id)],
      content_type: 'product',
      value: Number(product.price) || 0,
      currency: 'INR'
    });
  }
}

/**
 * Track Add to Cart
 */
export function trackAddToCart(product, quantity = 1, variant = {}) {
  if (typeof window === 'undefined' || !product) return;
  ensureDataLayer();

  const item = formatItemForAnalytics(product, quantity, variant);
  const totalValue = (Number(product.price) || 0) * (Number(quantity) || 1);

  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'INR',
      value: totalValue,
      items: item ? [item] : []
    }
  });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_name: product.title,
      content_ids: [String(product.id || product.product_id)],
      content_type: 'product',
      value: totalValue,
      currency: 'INR'
    });
  }
}

/**
 * Track Begin Checkout
 */
export function trackBeginCheckout(cartItems = [], grandTotal = 0) {
  if (typeof window === 'undefined') return;
  ensureDataLayer();

  const items = cartItems.map(item => formatItemForAnalytics(item, item.quantity, { color: item.color, size: item.size })).filter(Boolean);

  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'INR',
      value: Number(grandTotal) || 0,
      items
    }
  });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      num_items: cartItems.length,
      value: Number(grandTotal) || 0,
      currency: 'INR'
    });
  }
}

/**
 * Track Purchase / Conversion Confirmation
 */
export function trackPurchase(order) {
  if (typeof window === 'undefined' || !order) return;
  ensureDataLayer();

  const items = (order.items || []).map(item => ({
    item_id: String(item.product_id || item.id),
    item_name: item.title,
    currency: 'INR',
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    item_variant: [item.color, item.size].filter(Boolean).join(' / ') || undefined
  }));

  const orderValue = Number(order.total_amount || order.grandTotal || 0);

  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: String(order.order_number || order.id || ''),
      value: orderValue,
      tax: Number(order.tax_amount || 0),
      shipping: Number(order.shipping_fee || 0),
      currency: 'INR',
      coupon: order.coupon_code || undefined,
      items
    }
  });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value: orderValue,
      currency: 'INR',
      content_type: 'product'
    });
  }
}
