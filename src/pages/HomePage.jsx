import React from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { HeroSlideshow } from '../components/home/HeroSlideshow.jsx';
import { JharokhaCategories } from '../components/home/JharokhaCategories.jsx';
import { BentoMosaicSection } from '../components/home/BentoMosaicSection.jsx';
import { InsideBrandSection } from '../components/home/InsideBrandSection.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

export function HomePage() {
  // Scroll-reveal refs for sections
  const categoriesRef = useScrollReveal();
  const mosaicRef = useScrollReveal({ delay: 60 });
  const brandRef = useScrollReveal({ delay: 60 });

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      <SEO
        title="OCT9 - Women's Ethnic Wear, Suits, Sarees & Dresses"
        description="Shop ethnic wear, designer suits, sarees, and festive fashion at OCT9. Fast shipping across India and secure payment options."
      />

      {/* Semantic Top-Level H1 Heading for Accessibility & SEO */}
      <h1 className="sr-only">OCT9 - Women's Ethnic Wear & Fashion Collection</h1>

      {/* 1. Hero Slideshow Section */}
      <HeroSlideshow />

      {/* 2. Shop by Category (Jharokha Arches) */}
      <div ref={categoriesRef}>
        <JharokhaCategories />
      </div>

      {/* 3. Explore by Budget & Silhouette (All Categories & Budget Tiers) */}
      <div ref={mosaicRef}>
        <BentoMosaicSection />
      </div>

      {/* 4. Inside the Brand Editorial Story */}
      <div ref={brandRef}>
        <InsideBrandSection />
      </div>
    </div>
  );
}

