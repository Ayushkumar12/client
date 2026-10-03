import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const POSTER_SLIDES = [
  {
    id: 1,
    image: '/banners/hero_poster_1.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=90',
    title: 'Shining traditions, Glowing styles',
    subtitle: 'Festive Couture Collection 2026',
    link: '/category/festive-wear',
    ctaText: 'Explore Collection'
  },
  {
    id: 2,
    image: '/banners/hero_poster_2.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=90',
    title: 'Regal elegance, Bespoke weaves',
    subtitle: 'Handloom & Royal Bridal Edit',
    link: '/category/designer-suits',
    ctaText: 'Shop Bespoke Suits'
  },
  {
    id: 3,
    image: '/banners/hero_poster_3.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1920&q=90',
    title: 'Timeless silhouettes, Modern grace',
    subtitle: 'Grand Party & Gala Silhouettes',
    link: '/category/party-wear',
    ctaText: 'Shop Party Wear'
  }
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % POSTER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + POSTER_SLIDES.length) % POSTER_SLIDES.length);
  }, []);

  // Automatic slide rotation every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

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
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="OCT9 Luxury Hero Poster Slideshow"
    >
      {/* Compact Panoramic Slideshow Canvas */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[420px] xl:h-[460px] overflow-hidden">
        {POSTER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Link
                to={slide.link}
                className="block w-full h-full relative cursor-pointer group focus:outline-none"
                aria-label={slide.title}
              >
                {/* Full poster size image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-[1.015]"
                  onError={(e) => {
                    e.target.src = slide.fallbackImage;
                  }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle bottom gradient to ensure dots visibility */}
                <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
              </Link>
            </div>
          );
        })}

        {/* BOTTOM CENTER: Slideshow Pagination Dots (Matching Screenshot: ○ ● ○) */}
        <div className="absolute bottom-3 sm:bottom-5 md:bottom-6 inset-x-0 flex items-center justify-center space-x-2 sm:space-x-3 z-30 pointer-events-auto">
          {POSTER_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === idx
                  ? 'w-6 sm:w-7 h-2 sm:h-2.5 bg-[#F6D389] shadow-md ring-2 ring-[#F6D389]/40'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
