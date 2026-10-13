import React, { useState, useEffect } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { HeroSlideshow } from '../components/home/HeroSlideshow.jsx';
import { JharokhaCategories } from '../components/home/JharokhaCategories.jsx';
import { NewArrivalsSection } from '../components/home/NewArrivalsSection.jsx';
import { BrandPicksSection } from '../components/home/BrandPicksSection.jsx';
import { InsideBrandSection } from '../components/home/InsideBrandSection.jsx';
import { AdornedJewelsSection } from '../components/home/AdornedJewelsSection.jsx';
import { BentoMosaicSection } from '../components/home/BentoMosaicSection.jsx';
import { api } from '../services/api.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { useContent } from '../context/ContentContext.jsx';

export function HomePage() {
  const { getHomepageSections } = useContent();
  const sections = getHomepageSections();

  const [newArrivals, setNewArrivals] = useState([]);
  const [brandPicks, setBrandPicks] = useState([]);
  const [jewels, setJewels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll-reveal refs for each section
  const categoriesRef = useScrollReveal();
  const arrivalsRef = useScrollReveal({ delay: 60 });
  const picksRef = useScrollReveal({ delay: 60 });
  const brandRef = useScrollReveal({ delay: 60 });
  const jewelsRef = useScrollReveal({ delay: 60 });
  const mosaicRef = useScrollReveal({ delay: 60 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [resNew, resPicks, resJewels] = await Promise.all([
          api.getProducts({ new_arrival: 'true', limit: 8 }),
          api.getProducts({ category: 'stitched-suits', limit: 4 }),
          api.getProducts({ category: 'accessories', limit: 4 })
        ]);
        if (resNew.success) setNewArrivals(resNew.products);
        if (resPicks.success) setBrandPicks(resPicks.products);
        if (resJewels.success) setJewels(resJewels.products);
      } catch (e) {
        console.error('Failed to load homepage products:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Section renderers indexed by section id
  const sectionRenderers = {
    hero: () => <HeroSlideshow key="hero" />,
    categories: () => (
      <div key="categories" ref={categoriesRef}>
        <JharokhaCategories />
      </div>
    ),
    new_arrivals: () => (
      <div key="new_arrivals" ref={arrivalsRef}>
        <NewArrivalsSection products={newArrivals} loading={loading} />
      </div>
    ),
    brand_picks: () => (
      <div key="brand_picks" ref={picksRef}>
        <BrandPicksSection products={brandPicks} loading={loading} />
      </div>
    ),
    inside_brand: () => (
      <div key="inside_brand" ref={brandRef}>
        <InsideBrandSection />
      </div>
    ),
    adorned_jewels: () => (
      <div key="adorned_jewels" ref={jewelsRef}>
        <AdornedJewelsSection products={jewels} loading={loading} />
      </div>
    ),
    bento_mosaic: () => (
      <div key="bento_mosaic" ref={mosaicRef}>
        <BentoMosaicSection />
      </div>
    )
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      <SEO
        title="OCT9 - Women's Ethnic Wear, Suits, Sarees & Dresses"
        description="Shop ethnic wear, designer suits, sarees, and festive fashion at OCT9. Fast shipping across India and secure payment options."
      />

      {/* Semantic Top-Level H1 Heading for Accessibility & SEO */}
      <h1 className="sr-only">OCT9 - Women's Ethnic Wear & Fashion Collection</h1>

      {/* Admin Rearrangeable Homepage Sections */}
      {sections
        .filter((sec) => sec.enabled !== false)
        .map((sec) => {
          const renderSection = sectionRenderers[sec.id];
          return renderSection ? renderSection() : null;
        })}
    </div>
  );
}

