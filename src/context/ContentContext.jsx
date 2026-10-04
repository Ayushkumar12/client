import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ContentContext = createContext(null);

export const DEFAULT_SITE_CONTENT = {
  brand: {
    name: 'OCT9',
    tagline: 'Luxury Without Noise',
    sub_tagline: 'Timeless Indian Heritage Atelier',
    announcement_bar: '✨ Complimentary Express Air Shipping Across India on Orders Above ₹1,999 • Handcrafted with Love',
    support_phone: '+91 98765 43210',
    support_email: 'concierge@oct9.com',
    whatsapp_number: '919876543210',
    address: 'Atelier OCT9, Fashion Hub, Shahpur Jat, New Delhi 110049',
    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    pinterest_url: 'https://pinterest.com'
  },
  hero_slides: [
    {
      id: 1,
      image: '/banners/hero_banner_2.png',
      alt: 'Luxury Indian Ethnic Wear',
      title: 'Royal Heritage Drapes',
      subtitle: 'Festive & Bridal Atelier 2026',
      link: '/category/stitched-suits',
      active: true,
      order: 1
    },
    {
      id: 2,
      image: '/banners/hero_banner_5.png',
      alt: 'Artisanal Silk Drapes',
      title: 'Handloom Silk Elegance',
      subtitle: 'Pure Mulberry & Kanjivaram Weaves',
      link: '/category/sarees',
      active: true,
      order: 2
    },
    {
      id: 3,
      image: '/banners/hero_banner_1.png',
      alt: 'Designer Suits',
      title: 'Bespoke Tailored Suits',
      subtitle: 'Farshi, Anarkali & Palazzo Sets',
      link: '/category/stitched-suits',
      active: true,
      order: 3
    },
    {
      id: 4,
      image: '/banners/hero_banner_4.png',
      alt: 'Festive Collection',
      title: 'Festive Gala Edition',
      subtitle: 'Zardozi Embroidery & Regal Velvet',
      link: '/category/festive-wear',
      active: true,
      order: 4
    },
    {
      id: 5,
      image: '/banners/hero_banner_6.png',
      alt: 'Fine Ornaments',
      title: 'Zewar-e-Khaas Jewels',
      subtitle: 'Handcrafted Kundan & Polki Treasures',
      link: '/category/accessories',
      active: true,
      order: 5
    },
    {
      id: 6,
      image: '/banners/hero_banner_3.png',
      alt: 'Punjabi Jutti & Mojari',
      title: 'Artisan Punjabi Juttis',
      subtitle: 'Pure Leather & Embroidered Mojaris',
      link: '/category/jutti',
      active: true,
      order: 6
    }
  ],
  jharokha_categories: [
    {
      id: 'zewar',
      name: 'Zewar',
      slug: 'accessories',
      link: '/category/accessories',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85',
      tagline: 'Royal Jewels',
      active: true
    },
    {
      id: 'sharara-set',
      name: 'Sharara Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Sharara+Suit',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85',
      tagline: 'Regal Sharara',
      active: true
    },
    {
      id: 'farshi-salwaar',
      name: 'Farshi Salwaar Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Punjabi+Suit',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85',
      tagline: 'Heritage Cut',
      active: true
    },
    {
      id: 'a-line',
      name: 'A Line Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Straight+Suit',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
      tagline: 'Graceful Flow',
      active: true
    },
    {
      id: 'straight-fit',
      name: 'Straight Fit',
      slug: 'designer-suits',
      link: '/category/designer-suits',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85',
      tagline: 'Sharp Elegance',
      active: true
    },
    {
      id: 'anarkali-set',
      name: 'Anarkali Set',
      slug: 'festive-wear',
      link: '/category/festive-wear',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
      tagline: 'Imperial Flare',
      active: true
    },
    {
      id: 'sarees',
      name: 'Designer Sarees',
      slug: 'sarees',
      link: '/category/sarees',
      image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=600&q=85',
      tagline: 'Royal Drapes',
      active: true
    }
  ],
  sections: {
    new_arrivals: {
      badge: 'JUST DROPPED • ATELIER 2026',
      title: 'New Arrivals',
      subtitle: 'Freshly tailored royal silhouettes, intricate zardozi embroidery, and rich artisanal drapes.',
      cta_text: 'View All 50+ New Styles'
    },
    brand_picks: {
      badge: 'Curated Selection',
      title: 'The OCT9 Edit',
      subtitle: 'Handpicked artisanal silhouettes curated for effortless elegance, sublime comfort, and timeless appeal.',
      cta_text: 'Explore The Curated Edit'
    },
    inside_brand: {
      badge: 'The Royal Atelier',
      title: 'Inside OCT9',
      italic_tagline: 'Everyday elegance, redefined through master artistry.',
      description: 'At OCT9, each creation honours the rich legacy of Indian handlooms. From intricate zardozi threadwork to hand-selected pure silks, we craft timeless heirlooms meant to be cherished across generations.',
      cta_text: 'Explore Atelier',
      arches: [
        {
          title: 'Stitched Elegance',
          subtitle: 'Anarkali & Farshi Salwar Sets',
          badge: 'Ready-to-Wear',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=85',
          link: '/category/stitched-suits'
        },
        {
          title: 'Unstitched Couture',
          subtitle: 'Pure Mulberry & Roman Silks',
          badge: 'Custom Drape',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
          link: '/category/unstitched-suits'
        },
        {
          title: 'Heritage Drapes',
          subtitle: 'Organza & Banarasi Weaves',
          badge: 'Festive Luxe',
          image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=700&q=85',
          link: '/category/sarees'
        }
      ]
    },
    adorned_jewels: {
      badge: 'Jewellery Atelier',
      title: 'Adorned to Perfection',
      subtitle: 'Complete your royal look with hand-selected Kundan, Meenakari, and pearl statement jewels.',
      cta_text: 'Explore Full Jewellery Collection'
    },
    bento_mosaic: {
      badge: 'Curated Destinations',
      title: 'Explore by Budget & Silhouette',
      subtitle: 'Discover bespoke ethnic wear tailored for every celebratory occasion and budget tier.',
      zewar_card: {
        tag: 'Fine Ornaments',
        title: 'ZEWAR',
        subtitle: 'by OCT9',
        description: 'Handcrafted Kundan, Polki & Pearl masterpieces.',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
        link: '/category/accessories',
        cta_text: 'Shop Jewellery Atelier'
      },
      categories: [
        {
          title: 'New Arrivals',
          link: '/new-arrivals',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Under ₹2,500',
          link: '/category/all?max_price=2500',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: '₹2,500 – ₹7,500',
          link: '/category/all?min_price=2500&max_price=7500',
          image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Couture ₹7,500+',
          link: '/category/all?min_price=7500',
          image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Stitched Suits',
          link: '/category/stitched-suits',
          image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Royal Sarees',
          link: '/category/sarees',
          image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=600&q=85'
        }
      ]
    }
  },
  pillars: [
    {
      id: 1,
      title: 'Artisan Made',
      desc: 'Handcrafted heritage & bespoke embroidery'
    },
    {
      id: 2,
      title: 'Weekly Launches',
      desc: 'Curated festive edits & fresh designer drops'
    },
    {
      id: 3,
      title: 'Premium Fabrics',
      desc: 'Pure silks, fine chanderi & royal weaves'
    },
    {
      id: 4,
      title: 'Quality Stitching',
      desc: 'Master craftsmanship & precision tailoring'
    }
  ],
  page_availability: {
    'stitched-suits': { status: 'active', title: 'Stitched Suits', teaser: 'Ready-to-wear Farshi, Anarkali and Palazzo sets.', launch_date: '' },
    'unstitched-suits': { status: 'active', title: 'Unstitched Suits', teaser: 'Pure Mulberry and Roman silk unstitched sets.', launch_date: '' },
    'sarees': { status: 'active', title: 'Sarees', teaser: 'Royal heritage weaves in Kanjivaram, Organza and Silk.', launch_date: '' },
    'designer-suits': { status: 'active', title: 'Designer Suits', teaser: 'Bespoke couture suits tailored for royalty.', launch_date: '' },
    'festive-wear': { status: 'active', title: 'Festive Wear', teaser: 'Grand festive celebrations and gala drapes.', launch_date: '' },
    'party-wear': { status: 'active', title: 'Party Wear', teaser: 'Glamorous sequin and velvet outfits.', launch_date: '' },
    'accessories': { status: 'active', title: 'Accessories & Jewels', teaser: 'Handcrafted Kundan and Polki treasures.', launch_date: '' },
    'jutti': { status: 'active', title: 'Punjabi Juttis', teaser: 'Authentic handmade leather and embroidered juttis.', launch_date: '' },
    'new-arrivals': { status: 'active', title: 'New Arrivals', teaser: 'Fresh drops straight from our atelier.', launch_date: '' }
  }
};

const API_BASE = '/api/content';

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  // Fetch Public Content
  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/public`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.content) {
          setContent((prev) => ({
            ...DEFAULT_SITE_CONTENT,
            ...data.content,
            brand: { ...DEFAULT_SITE_CONTENT.brand, ...(data.content.brand || {}) },
            sections: { ...DEFAULT_SITE_CONTENT.sections, ...(data.content.sections || {}) },
            page_availability: { ...DEFAULT_SITE_CONTENT.page_availability, ...(data.content.page_availability || {}) }
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch CMS content, using default fallbacks:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Admin Update Content
  const updateContent = async (updates) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data && data.success && data.content) {
        setContent(data.content);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update content' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Admin Reset Section
  const resetSection = async (section) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ section })
      });
      const data = await res.json();
      if (data && data.success && data.content) {
        setContent(data.content);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to reset content' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Helper: Get Page Availability Status
  const getPageAvailability = (slug) => {
    if (!slug) return { status: 'active', title: 'All Collections', teaser: '', launch_date: '' };
    const normalized = slug.toLowerCase();
    const match = content.page_availability?.[normalized];
    if (match) return match;

    // Aliases
    if (normalized === 'suits' && content.page_availability?.['stitched-suits']) {
      return content.page_availability['stitched-suits'];
    }
    if (normalized === 'juttis' && content.page_availability?.['jutti']) {
      return content.page_availability['jutti'];
    }
    if (normalized === 'saree' && content.page_availability?.['sarees']) {
      return content.page_availability['sarees'];
    }

    return {
      status: 'active',
      title: slug.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      teaser: '',
      launch_date: ''
    };
  };

  // Helper: Is Page Coming Soon
  const isComingSoon = (slug) => {
    const info = getPageAvailability(slug);
    return info && info.status === 'coming_soon';
  };

  // Helper: Is Page Maintenance
  const isMaintenance = (slug) => {
    const info = getPageAvailability(slug);
    return info && info.status === 'maintenance';
  };

  // Helper: Get Section
  const getSection = (key) => {
    return content.sections?.[key] || DEFAULT_SITE_CONTENT.sections[key] || {};
  };

  // Helper: Get Brand
  const getBrand = () => {
    return content.brand || DEFAULT_SITE_CONTENT.brand;
  };

  // Helper: Get Active Hero Slides
  const getHeroSlides = () => {
    const slides = content.hero_slides || DEFAULT_SITE_CONTENT.hero_slides;
    return slides.filter((s) => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Helper: Get Active Jharokha Categories
  const getJharokhaCategories = () => {
    const cats = content.jharokha_categories || DEFAULT_SITE_CONTENT.jharokha_categories;
    return cats.filter((c) => c.active !== false);
  };

  // Helper: Get Brand Pillars
  const getPillars = () => {
    return content.pillars || DEFAULT_SITE_CONTENT.pillars;
  };

  const value = {
    content,
    loading,
    refreshContent: fetchContent,
    updateContent,
    resetSection,
    getPageAvailability,
    isComingSoon,
    isMaintenance,
    getSection,
    getBrand,
    getHeroSlides,
    getJharokhaCategories,
    getPillars
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
