import React, { useState, useEffect, useRef, useCallback } from 'react';

const POSTER_SLIDES = [
  {
    id: 1,
    image: '/banners/hero_banner_2.png',
    fallbackImage: '/banners/hero_banner_2.png',
    title: 'Timeless Ethnic Elegance'
  },
  {
    id: 2,
    image: '/banners/hero_banner_5.png',
    fallbackImage: '/banners/hero_banner_5.png',
    title: 'Beautiful Salwar Suits for Every You'
  },
  {
    id: 3,
    image: '/banners/hero_banner_1.png',
    fallbackImage: '/banners/hero_banner_1.png',
    title: 'Our Exclusive Salwar Suits'
  },
  {
    id: 4,
    image: '/banners/hero_banner_4.png',
    fallbackImage: '/banners/hero_banner_4.png',
    title: 'Festive Wear'
  },
  {
    id: 5,
    image: '/banners/hero_banner_6.png',
    fallbackImage: '/banners/hero_banner_6.png',
    title: 'Elegant Accessories'
  },
  {
    id: 6,
    image: '/banners/hero_banner_3.png',
    fallbackImage: '/banners/hero_banner_3.png',
    title: 'Authentic Punjabi Juttis'
  }
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % POSTER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + POSTER_SLIDES.length) % POSTER_SLIDES.length);
  }, []);

  // Preload all banner images so transitions never stall or stutter
  useEffect(() => {
    POSTER_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Automatic uninterrupted slide rotation every 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % POSTER_SLIDES.length);
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentSlide]);

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
        {POSTER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="w-full h-full relative">
                {/* Full poster size image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.src = slide.fallbackImage;
                  }}
                  loading="eager"
                />

                {/* Subtle bottom gradient to ensure dots visibility */}
                <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* BOTTOM CENTER: Slideshow Pagination Dots */}
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-5 inset-x-0 flex items-center justify-center space-x-1.5 sm:space-x-2.5 z-30 pointer-events-auto">
          {POSTER_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === idx
                  ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-[#F6D389] shadow-md ring-2 ring-[#F6D389]/40'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
