import React, { useState, useEffect } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { HeroSlideshow } from '../components/home/HeroSlideshow.jsx';
import { JharokhaCategories } from '../components/home/JharokhaCategories.jsx';
import { NewArrivalsSection } from '../components/home/NewArrivalsSection.jsx';
import { api } from '../services/api.js';

export function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredSuits, setFeaturedSuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resNew, resSuits] = await Promise.all([
          api.getProducts({ new_arrival: 'true', limit: 8 }),
          api.getProducts({ category: 'suits', limit: 4 })
        ]);
        if (resNew.success) setNewArrivals(resNew.products);
        if (resSuits.success) setFeaturedSuits(resSuits.products);
      } catch (e) {
        console.error('Failed to load homepage products:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      <SEO
        title="OCT9 | Timeless Ethnic Elegance - Luxury Suits, Sarees & Festive Wear"
        description="Shop exclusive Indian ethnic wear, designer suits, anarkalis, sarees and festive outfits at OCT9. Enjoy Fast Express Delivery via Shiprocket and 100% Secure Razorpay Checkout."
      />

      {/* 1. Dynamic Luxury Slideshow Hero Section */}
      <HeroSlideshow />

      {/* 2. Shop by Silhouette - Royal Mughal Jharokha Arch Category Section */}
      <JharokhaCategories />

      {/* 3. Dedicated New Arrivals Showcase Section with Category Filters & CTA */}
      <NewArrivalsSection products={newArrivals} loading={loading} />
    </div>
  );
}
