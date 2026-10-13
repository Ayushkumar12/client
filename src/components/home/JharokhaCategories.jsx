import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

// 4-Pointed Royal Mughal Jharokha Arch / Medallion Path (Outer Outline)
// Coordinates calibrated on 200 x 210 viewBox
const JHAROKHA_OUTER_PATH = `
  M 100 6
  C 100 24, 118 28, 134 28
  C 162 28, 180 50, 180 76
  C 180 92, 186 100, 196 105
  C 186 110, 180 118, 180 134
  C 180 160, 162 182, 134 182
  C 118 182, 100 186, 100 204
  C 100 186, 82 182, 66 182
  C 38 182, 20 160, 20 134
  C 20 118, 14 110, 4 105
  C 14 100, 20 92, 20 76
  C 20 50, 38 28, 66 28
  C 82 28, 100 24, 100 6
  Z
`.replace(/\s+/g, ' ').trim();

// Inner Inset Path for Double Gold Border & Exact Image Mask
const JHAROKHA_INNER_PATH = `
  M 100 14
  C 100 28, 116 34, 130 34
  C 154 34, 170 54, 170 76
  C 170 90, 176 99, 185 105
  C 176 111, 170 120, 170 134
  C 170 156, 154 176, 130 176
  C 116 176, 100 182, 100 196
  C 100 182, 84 176, 70 176
  C 46 176, 30 156, 30 134
  C 30 120, 24 111, 15 105
  C 24 99, 30 90, 30 76
  C 30 54, 46 34, 70 34
  C 84 34, 100 28, 100 14
  Z
`.replace(/\s+/g, ' ').trim();

const getCategoryImageUrl = (cat) => {
  if (cat?.slug === 'sarees' && (!cat.image || cat.image.includes('1610030469668-9655ecbbdd13'))) {
    return 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=85';
  }
  return cat?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85';
};

export function JharokhaCategories() {
  const { getJharokhaCategories } = useContent();
  const categories = getJharokhaCategories();

  const scrollRef = useRef(null);
  const singleSetWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef(null);

  const [hasOverflow, setHasOverflow] = useState(false);

  // Helper to pause auto-scroll for a specific duration, then smoothly resume
  const pauseAutoScroll = useCallback((durationMs = 1200) => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    if (durationMs > 0) {
      pauseTimeoutRef.current = setTimeout(() => {
        isPausedRef.current = false;
      }, durationMs);
    }
  }, []);

  // Measure whether total width of categories exceeds available container space
  const checkOverflow = useCallback(() => {
    if (!scrollRef.current || !categories || categories.length === 0) return;
    const scrollEl = scrollRef.current;

    const items = scrollEl.querySelectorAll('[data-first-set="true"]');
    if (!items || items.length === 0) return;

    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    if (firstItem && lastItem) {
      let gap = 16;
      if (items.length > 1) {
        const item1 = items[1];
        gap = Math.max(8, item1.offsetLeft - (firstItem.offsetLeft + firstItem.offsetWidth));
      }

      const totalFirstSetWidth = (lastItem.offsetLeft + lastItem.offsetWidth) - firstItem.offsetLeft + gap;
      singleSetWidthRef.current = totalFirstSetWidth;

      const containerWidth = scrollEl.clientWidth;
      const isOver = totalFirstSetWidth > containerWidth + 6;

      setHasOverflow(isOver);
    }
  }, [categories]);

  // Keep overflow detection reactive to window resizes and font loading
  useEffect(() => {
    checkOverflow();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && scrollRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      resizeObserver.observe(scrollRef.current);
    }

    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(checkOverflow, 250);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [checkOverflow]);

  // Continuous, silky smooth auto-scroll when content overflows available space
  useEffect(() => {
    if (!hasOverflow) {
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
      return;
    }

    // Respect user's system accessibility motion setting
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId;
    let lastTimestamp = performance.now();
    const speed = 28; // pixels per second for a relaxed luxury gallery pace

    const step = (timestamp) => {
      const elapsed = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!isPausedRef.current && scrollRef.current) {
        const scrollEl = scrollRef.current;
        const setWidth = singleSetWidthRef.current;

        if (setWidth > 0) {
          scrollEl.scrollLeft += speed * elapsed;

          // Seamless loop back when first complete set has passed
          if (scrollEl.scrollLeft >= setWidth) {
            scrollEl.scrollLeft -= setWidth;
          }
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasOverflow]);

  // Handle manual touch/trackpad swipes with seamless infinite loop normalization
  const handleScroll = () => {
    if (!scrollRef.current || !hasOverflow) return;
    const scrollEl = scrollRef.current;
    const setWidth = singleSetWidthRef.current;

    if (setWidth > 0) {
      if (scrollEl.scrollLeft >= setWidth * 1.85) {
        scrollEl.scrollLeft -= setWidth;
      } else if (scrollEl.scrollLeft < 0) {
        scrollEl.scrollLeft += setWidth;
      }
    }
  };

  // Step scroll with Prev / Next Chevron buttons
  const handleScrollBy = (direction) => {
    if (!scrollRef.current) return;
    pauseAutoScroll(3200);
    const scrollAmount = Math.max(180, scrollRef.current.clientWidth * 0.45);
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  if (!categories || categories.length === 0) return null;

  // Render duplicated list ONLY when overflowing so it loops endlessly with zero gap
  const displayCategories = hasOverflow ? [...categories, ...categories] : categories;

  return (
    <section className="relative w-full py-3 sm:py-4 md:py-5 lg:py-6 bg-gradient-to-b from-[#FAF7F2] via-[#FDFBF7] to-[#FAF7F2] border-y border-[#EFE8DC] overflow-hidden select-none">
      {/* Background Subtle Luxury Texture Watermark */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(#5A1827 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Relative Container */}
      <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Subtle Edge Gradient Fades (Shown only when content overflows) */}
        {hasOverflow && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#FAF7F2] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10" />

            {/* Previous Chevron Button */}
            <button
              type="button"
              onClick={() => handleScrollBy(-1)}
              className="hidden sm:flex absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-[#C5A880]/50 shadow-md items-center justify-center text-[#5A1827] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Chevron Button */}
            <button
              type="button"
              onClick={() => handleScrollBy(1)}
              className="hidden sm:flex absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-[#C5A880]/50 shadow-md items-center justify-center text-[#5A1827] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
              aria-label="Next categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseEnter={() => {
            isPausedRef.current = true;
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
          }}
          onMouseLeave={() => pauseAutoScroll(1000)}
          onTouchStart={() => {
            isPausedRef.current = true;
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
          }}
          onTouchEnd={() => pauseAutoScroll(2200)}
          onWheel={() => pauseAutoScroll(1500)}
          className={`flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 pb-1 sm:pb-1.5 pt-0.5 no-scrollbar ${
            hasOverflow
              ? 'justify-start overflow-x-auto cursor-grab active:cursor-grabbing'
              : 'justify-center lg:justify-between overflow-x-hidden'
          }`}
        >
          {displayCategories.map((cat, idx) => {
            const isDuplicate = hasOverflow && idx >= categories.length;
            const originalIdx = idx % categories.length;
            const catId = isDuplicate ? `dup-${cat.id || cat.slug || originalIdx}-${idx}` : (cat.id || cat.slug || `category-${originalIdx}`);
            const clipId = `jharokha-clip-${catId}`;
            const imageUrl = getCategoryImageUrl(cat);

            return (
              <Link
                key={catId}
                to={cat.link || `/category/${cat.slug}`}
                data-first-set={!isDuplicate ? "true" : undefined}
                data-item-index={originalIdx}
                tabIndex={isDuplicate ? -1 : 0}
                aria-hidden={isDuplicate ? "true" : undefined}
                className="group flex flex-col items-center flex-shrink-0 min-w-[70px] sm:min-w-[88px] md:min-w-[98px] lg:min-w-[110px] xl:min-w-[125px] 2xl:min-w-[135px] max-w-[105px] sm:max-w-[125px] lg:max-w-[145px] xl:max-w-[160px] focus:outline-none transition-transform duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5"
                aria-label={cat.name}
              >
                {/* Royal Jharokha SVG Frame - Scaled proportionally */}
                <div className="relative w-16 h-[70px] sm:w-20 sm:h-[86px] md:w-22 md:h-[94px] lg:w-24 lg:h-[102px] xl:w-28 xl:h-[118px] 2xl:w-30 2xl:h-[126px] filter drop-shadow-[0_2px_6px_rgba(184,147,88,0.18)] sm:drop-shadow-[0_4px_12px_rgba(184,147,88,0.18)] group-hover:drop-shadow-[0_8px_20px_rgba(184,147,88,0.35)] transition-all duration-500 ease-out">
                  <svg
                    viewBox="0 0 200 210"
                    className="w-full h-full overflow-visible"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      {/* Mask for the Inner Image */}
                      <clipPath id={clipId}>
                        <path d={JHAROKHA_INNER_PATH} />
                      </clipPath>
                    </defs>

                    {/* Outer Solid Fill Behind Image */}
                    <path
                      d={JHAROKHA_OUTER_PATH}
                      fill="#FFFFFF"
                    />

                    {/* Masked Category Image */}
                    <g clipPath={`url(#${clipId})`}>
                      <image
                        href={imageUrl}
                        x="0"
                        y="0"
                        width="200"
                        height="210"
                        preserveAspectRatio="xMidYMid slice"
                        className="transition-transform duration-700 ease-out origin-center group-hover:scale-110"
                      />
                      {/* Subtle Warm Amber Gradient Overlay */}
                      <rect
                        x="0"
                        y="0"
                        width="200"
                        height="210"
                        fill="rgba(90, 24, 39, 0.04)"
                        className="group-hover:fill-transparent transition-colors duration-300"
                      />
                    </g>

                    {/* Outer Gold Contour Stroke */}
                    <path
                      d={JHAROKHA_OUTER_PATH}
                      fill="none"
                      stroke="#C5A880"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[#936829] transition-colors duration-300"
                    />

                    {/* Inner Fine Gold Hairline Stroke */}
                    <path
                      d={JHAROKHA_INNER_PATH}
                      fill="none"
                      stroke="#B89358"
                      strokeWidth="1"
                      strokeOpacity="0.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[#5A1827] group-hover:stroke-opacity-60 transition-all duration-300"
                    />
                  </svg>
                </div>

                {/* Category Title Label */}
                <div className="mt-1.5 sm:mt-2 text-center px-0.5 w-full">
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] xl:text-sm font-semibold tracking-tight text-neutral-800 group-hover:text-brand-maroon transition-colors duration-200 block truncate leading-tight">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default JharokhaCategories;
