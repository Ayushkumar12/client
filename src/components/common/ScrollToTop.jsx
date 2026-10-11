import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every page navigation starts at the very top (scroll 0,0)
 * rather than retaining the scroll offset of previous pages.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window and document scroll positions immediately on route change
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
