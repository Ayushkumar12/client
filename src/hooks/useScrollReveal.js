import { useEffect, useRef } from 'react';

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Returns a ref to attach to the element you want to animate in.
 *
 * @param {Object} options
 * @param {number} options.threshold - visibility ratio to trigger (0-1)
 * @param {number} options.delay - stagger delay in ms
 */
export function useScrollReveal({ threshold = 0.12, delay = 0 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, delay]);

  return ref;
}
