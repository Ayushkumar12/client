/**
 * UTM Tracking Utility
 * Captures query parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid)
 * and persists them in sessionStorage for the duration of the customer shopping session.
 */

const UTM_STORAGE_KEY = 'oct9_utm_params';

export function captureUtmParams() {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid'
    ];

    const captured = {};
    let hasUtm = false;

    for (const key of utmKeys) {
      const val = params.get(key);
      if (val) {
        captured[key] = val.trim();
        hasUtm = true;
      }
    }

    if (hasUtm) {
      captured.captured_at = new Date().toISOString();
      captured.landing_page = window.location.pathname;
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
      return captured;
    }

    // Return existing session UTMs if available
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
  } catch (err) {
    console.warn('UTM tracking capture error:', err);
  }

  return {};
}

export function getUtmParams() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return {};
}
