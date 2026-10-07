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

export function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [brandPicks, setBrandPicks] = useState([]);
  const [jewels, setJewels] = useState([]);
  const [loading, setLoading] = useState(true);

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

      {/* 2. Shop by Category */}
      <JharokhaCategories />

      {/* 3. New Arrivals Showcase */}
      <NewArrivalsSection products={newArrivals} loading={loading} />

      {/* 4. Featured Picks Showcase */}
      <BrandPicksSection products={brandPicks} loading={loading} />

      {/* 5. About Brand Section */}
      <InsideBrandSection />

      {/* 6. Jewellery & Accessories Section */}
      <AdornedJewelsSection products={jewels} loading={loading} />

      {/* 7. Category & Budget Mosaic */}
      <BentoMosaicSection />
    </div>
  );
}

