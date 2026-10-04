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
        title="OCT9 | Timeless Ethnic Elegance - Luxury Suits, Sarees & Festive Wear"
        description="Shop exclusive Indian ethnic wear, designer suits, anarkalis, sarees and festive outfits at OCT9. Enjoy Fast Express Delivery via Shiprocket and 100% Secure Razorpay Checkout."
      />

      {/* 1. Dynamic Luxury Slideshow Hero Section */}
      <HeroSlideshow />

      {/* 2. Shop by Silhouette - Royal Mughal Jharokha Arch Category Section */}
      <JharokhaCategories />

      {/* 3. Dedicated New Arrivals Showcase Section */}
      <NewArrivalsSection products={newArrivals} loading={loading} />

      {/* 4. OCT9 Picks - Curated Quality & Comfort Showcase */}
      <BrandPicksSection products={brandPicks} />

      {/* 5. Inside OCT9 - Brand Narrative & 3 Mughal Jharokha Arch Cards */}
      <InsideBrandSection />

      {/* 6. Adorned to Perfection - Jewellery & Accessories Showcase */}
      <AdornedJewelsSection products={jewels} />

      {/* 7. Bento Mosaic - Zewar Spotlight & Shop by Budget / Category */}
      <BentoMosaicSection />
    </div>
  );
}

