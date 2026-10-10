import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';

export function HeroSlideshow() {
  const { getHeroSlides } = useContent();
  const slides = getHeroSlides();

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Preload all banner images so transitions never stall or stutter
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  // Reset slide index if slides change and current is out of bounds
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  // Automatic uninterrupted slide rotation every 4.5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentSlide, totalSlides]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden select-none bg-[#24130C]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="OCT9 Luxury Hero Poster Slideshow"
    >
      {/* Aspect Ratio Preserving Slideshow Canvas (1024x374) */}
      <div className="relative w-full aspect-[1024/374] overflow-hidden">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const contentEl = (
            <div className="w-full h-full relative cursor-pointer group">
              {/* Full poster size image */}
              <img
                src={slide.image}
                alt={slide.title || slide.alt || 'OCT9 Luxury Banner'}
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-102"
                onError={(e) => {
                  e.target.src = '/banners/hero_banner_2.png';
                }}
                loading="eager"
              />

              {/* Subtle bottom gradient to ensure dots visibility */}
              <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
            </div>
          );

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              {slide.link ? (
                <Link to={slide.link} className="block w-full h-full">
                  {contentEl}
                </Link>
              ) : (
                contentEl
              )}
            </div>
          );
        })}

        {/* BOTTOM CENTER: Slideshow Pagination Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-5 inset-x-0 flex items-center justify-center space-x-1.5 sm:space-x-2.5 z-30 pointer-events-auto">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${currentSlide === idx
                    ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-[#F6D389] shadow-md ring-2 ring-[#F6D389]/40'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/60 hover:bg-white'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
