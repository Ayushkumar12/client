import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 p-2.5 sm:p-3 bg-neutral-900/90 hover:bg-neutral-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer backdrop-blur-xs border border-white/10"
      title="Back to top"
    >
      <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
    </button>
  );
}

export default BackToTopButton;
