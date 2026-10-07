import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Grid,
  LayoutGrid,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw as RefreshCcw,
  Award,
  Headphones,
  Mail,
  Tag,
  ChevronRight,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { api } from '../services/api.js';

export function ListingPage({ defaultCategory = null, isNewArrivals = false }) {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getPageAvailability } = useContent();

  const currentCategory = isNewArrivals ? 'new-arrivals' : (categorySlug || defaultCategory || 'all');
  const pageAvailability = getPageAvailability(currentCategory);
  const searchParam = searchParams.get('search') || '';
  const subCategoryParam = searchParams.get('sub_category') || '';
  const fabricParam = searchParams.get('fabric') || '';
  const occasionParam = searchParams.get('occasion') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState(fabricParam ? [fabricParam] : []);
  const [selectedOccasions, setSelectedOccasions] = useState(occasionParam ? [occasionParam] : []);
  const [selectedTypes, setSelectedTypes] = useState(subCategoryParam ? [subCategoryParam] : []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(15000);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Common Color Palette Swatches matching screenshots
  const colorOptions = [
    { name: 'Black', hex: '#121212' },
    { name: 'Ivory / White', hex: '#FAF7F2' },
    { name: 'Beige / Gold', hex: '#E5D5C5' },
    { name: 'Blush Pink', hex: '#F472B6' },
    { name: 'Crimson Red', hex: '#991B1B' },
    { name: 'Deep Wine', hex: '#5A1827' },
    { name: 'Emerald Green', hex: '#065F46' },
    { name: 'Royal Blue', hex: '#1E3A8A' },
    { name: 'Lavender', hex: '#C084FC' },
    { name: 'Mint Seafoam', hex: '#A7F3D0' }
  ];

  // Specific Category Flags
  const isDesignerSuits = currentCategory === 'designer-suits';
  const isStitchedSuits = currentCategory === 'stitched-suits' || currentCategory === 'suits';
  const isUnstitchedSuits = currentCategory === 'unstitched-suits';
  const isNewArrivalsPage = isNewArrivals || currentCategory === 'new-arrivals';
  const isPartyWear = currentCategory === 'party-wear';
  const isFestiveWear = currentCategory === 'festive-wear';
  const isAccessories = currentCategory === 'accessories';
  const isJutti = currentCategory === 'jutti' || currentCategory === 'juttis';
  const isSaree = currentCategory === 'sarees' || currentCategory === 'saree';

  // Specific configuration definitions per category matching all screenshots exactly
  const getCategoryConfig = () => {
    if (isDesignerSuits) {
      return {
        title: 'Designer Suits',
        heading: 'Designer Suits',
        tagline: 'ROYAL BESPOKE ATELIER',
        description: 'Exquisite hand-embroidered bespoke suits tailored for royalty and special celebrations.',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        badges: ['Premium Fabrics', 'Bespoke Designs', 'Tailored for Royalty'],
        theme: 'maroon_gold',
        typeFilterTitle: 'Suit Type',
        typeOptions: ['Silk Embellished Designer Suits', 'Anarkali Designer Suits', 'Organza Designer Suits', 'Chanderi Designer Suits', 'Velvet Designer Suits', 'Bespoke Designer Suits', 'Indo-Western Designer Suits'],
        sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        fabricOptions: ['Georgette', 'Chanderi Silk', 'Silk', 'Organza', 'Velvet', 'Net', 'Wool Blend'],
        occasionOptions: ['Wedding', 'Festival', 'Party Wear', 'Engagement', 'Reception', 'Daily Wear'],
        priceMin: 1499,
        priceMax: 15000
      };
    }

    if (isUnstitchedSuits) {
      return {
        title: 'Unstitched Suits',
        heading: 'Unstitched Suits',
        tagline: 'PURE FABRIC FOR BESPOKE FIT',
        description: 'Premium unstitched 3-piece suit fabrics in rich cotton, mulberry silk, and roman silk.',
        heroImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        badges: ['100% Pure Fabrics', 'Custom Fit Freedom', 'Unstitched 3-Piece Sets'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Fabric Type',
        typeOptions: ['Cotton Suits', 'Mulberry Silk Suits', 'Roman Silk Suits', 'Chanderi Unstitched', 'Georgette Unstitched', 'Organza Unstitched'],
        sizeOptions: ['Unstitched (Free Size)'],
        fabricOptions: ['Pure Cotton', 'Mulberry Silk', 'Roman Silk', 'Chanderi Silk', 'Pure Georgette', 'Modal Silk'],
        occasionOptions: ['Daily Wear', 'Festive', 'Office Wear', 'Party Wear', 'Casual'],
        hasAvailabilityFilter: true,
        priceMin: 799,
        priceMax: 9999
      };
    }

    if (isStitchedSuits) {
      return {
        title: 'Stitched Suits',
        heading: 'Stitched Suits',
        tagline: 'READY-TO-WEAR BESPOKE SUITS',
        description: 'Perfectly tailored ethnic suits ready for your grand celebrations and everyday charm.',
        heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        badges: ['Ready to Wear', 'Precision Tailoring', 'Wide Range of Sizes'],
        theme: 'dark_burgundy',
        typeFilterTitle: 'Suit Style',
        typeOptions: ['Farshi Salwar Suits', 'Palazzo Suits', 'Sharara Suits', 'Straight Suits', 'Anarkali Suits', 'Pakistani Suits'],
        sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        fabricOptions: ['Georgette', 'Chanderi', 'Silk', 'Cotton', 'Rayon', 'Velvet', 'Organza'],
        occasionOptions: ['Festive', 'Daily Wear', 'Party Wear', 'Wedding', 'Casual'],
        hasAvailabilityFilter: true,
        priceMin: 999,
        priceMax: 15000
      };
    }

    if (isNewArrivalsPage) {
      return {
        title: 'New Arrivals',
        heading: 'New Arrivals',
        tagline: 'FRESH FROM OUR ATELIER',
        description: 'Discover the latest collection of premium ethnic wear crafted for your special moments.',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        badges: ['Latest Designs', 'Bespoke Drapes', 'Limited Stock'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Category',
        typeOptions: ['Farshi Salwar Suits', 'Palazzo Suits', 'Sharara Suits', 'Straight Suits', 'Anarkali Suits', 'Cotton Suits', 'Sarees', 'Accessories', 'Jutti', 'Party Wear'],
        sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        fabricOptions: ['Georgette', 'Chanderi', 'Silk', 'Cotton', 'Rayon', 'Velvet'],
        occasionOptions: ['Wedding', 'Festive', 'Party Wear', 'Casual'],
        priceMin: 999,
        priceMax: 15000
      };
    }

    if (isAccessories) {
      return {
        title: 'Accessories',
        heading: 'Accessories',
        tagline: 'HANDCRAFTED TREASURES',
        description: 'Traditional elegance and handcrafted treasures for the modern woman.',
        heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
        badges: ['Handcrafted Designs', 'Premium Quality', 'Free Shipping Above ₹1,999'],
        theme: 'cream_luxury',
        circularSubcategories: [
          { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80' },
          { name: 'Earrings & Jhumkas', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80' },
          { name: 'Necklace Sets', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80' },
          { name: 'Bangles & Kadas', image: 'https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=300&q=80' },
          { name: 'Potlis & Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80' }
        ],
        typeFilterTitle: 'Accessory Type',
        typeOptions: ['Rings', 'Earrings & Jhumkas', 'Necklace Sets', 'Bangles & Kadas', 'Potlis & Bags'],
        sizeOptions: [],
        fabricOptions: ['Brass & Kundan Polki', 'Meenakari & Brass', 'Raw Silk & Pearl', 'Freshwater Pearl', 'Brocade & Zari'],
        priceMin: 499,
        priceMax: 4999
      };
    }

    if (isJutti) {
      return {
        title: 'Punjabi Juttis',
        heading: 'Punjabi Juttis',
        tagline: 'AUTHENTIC HANDMADE MOJARI',
        description: 'Traditional elegance for the modern woman.',
        heroImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
        badges: ['Authentic Punjabi Artisans', 'Premium Quality', 'Free Shipping Above ₹1,999'],
        theme: 'cream_luxury',
        circularSubcategories: [
          { name: 'Embroidered Juttis', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Printed Juttis', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80' },
          { name: 'Traditional Juttis', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Wedding Juttis', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' }
        ],
        typeFilterTitle: 'Jutti Type',
        typeOptions: ['Embroidered Juttis', 'Printed Juttis', 'Traditional Juttis', 'Wedding Juttis'],
        sizeOptions: ['36', '37', '38', '39', '40', '41', '42'],
        fabricOptions: ['Pure Leather', 'Silk & Leather', 'Velvet & Leather', 'Raw Silk & Leather', 'Cotton & Leather'],
        priceMin: 899,
        priceMax: 4999
      };
    }

    if (isSaree) {
      return {
        title: 'Sarees',
        heading: 'Sarees',
        tagline: 'ROYAL HERITAGE DRAPES',
        description: 'Charming flowing drapes for every festive occasion.',
        heroImage: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=1200&q=85',
        badges: ['Employed Fabrics', 'Free Shipping Above ₹1,999', 'Easy Returns 7 Days Free Return'],
        theme: 'cream_luxury',
        circularSubcategories: [
          { name: 'Silk Sarees', image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=300&q=80' },
          { name: 'Organza Sarees', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
          { name: 'Banarasi Sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' },
          { name: 'Chiffon Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
          { name: 'Party Wear', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=300&q=80' }
        ],
        typeFilterTitle: 'Saree Type',
        typeOptions: ['Silk Sarees', 'Organza Sarees', 'Banarasi Sarees', 'Chiffon Sarees', 'Linen Sarees', 'Party Wear', 'Designer Sarees'],
        sizeOptions: ['Free Size'],
        fabricOptions: ['Kanjivaram Silk', 'Chiffon', 'Silk', 'Banarasi Silk', 'Georgette', 'Cotton/Linen', 'Organza', 'Crepe'],
        priceMin: 1499,
        priceMax: 9999
      };
    }

    if (isPartyWear) {
      return {
        title: 'Party Wear',
        heading: 'Party Wear',
        tagline: 'EXCLUSIVE EVENING SOIRÉE & GALA',
        description: 'Dazzling sequin, velvet, and bespoke ethnic party wear crafted for unforgettable evenings and celebrations.',
        heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85',
        badges: ['Handcrafted Embellishments', 'Premium Velvets & Silks', 'Free Shipping Above ₹1,999'],
        theme: 'cream_luxury',
        circularSubcategories: [
          { name: 'Reception Wear', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=300&q=80' },
          { name: 'Engagement Wear', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80' },
          { name: 'Cocktail Wear', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=300&q=80' },
          { name: 'Sangeet Wear', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
          { name: 'Evening Gowns', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80' },
          { name: 'Velvet Specials', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
          { name: 'Bridesmaid Outfits', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' }
        ],
        typeFilterTitle: 'Occasion Type',
        typeOptions: ['Reception Wear', 'Engagement Wear', 'Cocktail Wear', 'Sangeet Wear', 'Evening Gowns', 'Velvet Specials', 'Bridesmaid Outfits'],
        sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
        fabricOptions: ['Raw Silk & Wool Blend', 'Net & Georgette', 'Velvet', 'Organza', 'Silk', 'Chiffon', 'Satin Blend'],
        occasionOptions: ['Reception', 'Cocktail', 'Engagement', 'Sangeet', 'Party Wear', 'Wedding'],
        priceMin: 1499,
        priceMax: 15000
      };
    }

    if (isFestiveWear) {
      return {
        title: 'Festive Wear',
        heading: 'Festive Wear',
        tagline: 'ROYAL FESTIVE ATELIER',
        description: 'Celebrate every festival with royal festive styles.',
        heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        badges: ['Premium Fabrics', 'Exclusive Designs', 'Festive Season Collection'],
        theme: 'maroon_gold',
        circularSubcategories: [
          { name: 'Holi', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
          { name: 'Diwali', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=300&q=80' },
          { name: 'Karwa Chauth', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
          { name: 'Chhath Puja', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' },
          { name: 'Teej', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
          { name: 'Eid', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80' }
        ],
        typeFilterTitle: 'Festival',
        typeOptions: ['Holi', 'Diwali', 'Karwa Chauth', 'Chhath Puja', 'Teej', 'Eid'],
        categoryOptions: ['Anarkali Suits', 'Straight Suits', 'Sharara Suits', 'Punjabi Suits', 'Kurta Sets', 'Silk Sarees'],
        sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
        fabricOptions: ['Kanjivaram Silk', 'Georgette', 'Silk', 'Chanderi', 'Cotton & Silk', 'Velvet', 'Organza', 'Raw Silk'],
        priceMin: 1499,
        priceMax: 15000
      };
    }

    // Default fallback
    return {
      title: currentCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      heading: 'All Collections',
      tagline: 'LUXURY ETHNIC ATELIER',
      description: 'A perfect blend of tradition and contemporary elegance tailored for your special celebrations.',
      heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      badges: ['Handcrafted Designs', 'Premium Quality', 'Free Shipping Above ₹1,999'],
      theme: 'cream_luxury',
      typeFilterTitle: 'Category',
      typeOptions: ['Suits', 'Designer Suits', 'Festive Wear', 'Party Wear', 'Sarees', 'Accessories', 'Jutti'],
      sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      fabricOptions: ['Georgette', 'Chanderi Silk', 'Silk Blend', 'Cotton', 'Velvet', 'Raw Silk', 'Rayon'],
      priceMin: 999,
      priceMax: 15000
    };
  };

  const config = getCategoryConfig();

  useEffect(() => {
    fetchProducts();
  }, [
    currentCategory,
    subCategoryParam,
    searchParam,
    selectedSizes,
    selectedFabrics,
    selectedOccasions,
    selectedTypes,
    priceRange,
    selectedDiscount,
    sortBy,
    searchParams.get('page')
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = {
        category: currentCategory === 'all' || currentCategory === 'new-arrivals' ? undefined : currentCategory,
        new_arrival: isNewArrivalsPage ? 'true' : undefined,
        sub_category: selectedTypes.length > 0 ? selectedTypes.join(',') : (subCategoryParam || undefined),
        search: searchParam || undefined,
        max_price: priceRange < 15000 ? priceRange : undefined,
        size: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
        fabric: selectedFabrics.length > 0 ? selectedFabrics.join(',') : undefined,
        occasion: selectedOccasions.length > 0 ? selectedOccasions.join(',') : undefined,
        sort: sortBy,
        page,
        limit: 24,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: res.products?.length || 0 });
      }
    } catch (e) {
      console.error('Error fetching catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSizeToggle = (sz) => {
    setSelectedSizes(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
  };

  const handleFabricToggle = (fb) => {
    setSelectedFabrics(prev => prev.includes(fb) ? prev.filter(f => f !== fb) : [...prev, fb]);
  };

  const handleOccasionToggle = (oc) => {
    setSelectedOccasions(prev => prev.includes(oc) ? prev.filter(o => o !== oc) : [...prev, oc]);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedTypes([]);
    setSelectedColors([]);
    setPriceRange(15000);
    setSelectedDiscount(null);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const activeFiltersCount = selectedSizes.length + selectedFabrics.length + selectedOccasions.length + selectedTypes.length + (priceRange < 15000 ? 1 : 0) + (selectedDiscount ? 1 : 0);

  // Cohesive Brand Theme Classes
  const pageBgClass = 'bg-[#FAF7F2] text-neutral-900';
  const sidebarBgClass = 'bg-white border-brand-border text-neutral-800';

  return (
    <div className={`min-h-screen ${pageBgClass} pb-16 transition-colors duration-300`}>
      <SEO
        title={`${config.heading} | OCT9 Luxury Ethnic Wear`}
        description={config.description}
      />

      {/* Clean Category Header */}
      <section className="border-b border-brand-border/60 bg-white/70 backdrop-blur-xs py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs font-medium tracking-wide text-neutral-500">
              <Link to="/" className="hover:text-brand-maroon transition-colors">Home</Link>
              <span>/</span>
              <span className="capitalize font-semibold text-neutral-900">{config.heading}</span>
            </div>

            <div className="flex items-baseline space-x-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                {config.heading}
              </h1>
              <span className="text-xs text-neutral-500 font-medium">
                ({pagination.total} {pagination.total === 1 ? 'Style' : 'Styles'})
              </span>
            </div>
            
            <p className="text-xs text-neutral-500 font-light max-w-xl line-clamp-1">
              {config.description}
            </p>
          </div>

          {/* Quick Filters / Summary Badges */}
          <div className="flex items-center space-x-2 text-xs">
            {config.badges.slice(0, 2).map((badge, idx) => (
              <span key={idx} className="bg-brand-cream/90 text-brand-maroon font-semibold px-3 py-1 rounded-full border border-brand-border text-[11px]">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT: SIDEBAR FILTERS + PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Control Bar: Total Count + Sort By */}
        <div className="flex items-center justify-between pb-5 border-b border-brand-border">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs border bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50"
            >
              <Filter className="w-3.5 h-3.5 text-brand-maroon" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
            <p className="text-xs sm:text-sm text-neutral-600">
              <strong className="text-neutral-900">{config.heading}</strong>: Showing <strong>{pagination.total}</strong> products
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs hidden sm:inline text-neutral-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm rounded-lg px-3 py-2 font-medium cursor-pointer shadow-2xs border bg-white text-neutral-800 border-neutral-300 focus:outline-none focus:border-brand-maroon"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8 items-start">
          {/* LEFT SIDEBAR FILTERS (Desktop) */}
          <aside className={`hidden lg:block space-y-6 p-5 rounded-2xl border shadow-2xs sticky top-28 ${sidebarBgClass}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/40">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-maroon" />
                <span className="font-serif font-bold text-sm">Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-brand-maroon hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Category / Subcategory Type Checkboxes */}
            {config.typeOptions && config.typeOptions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">{config.typeFilterTitle}</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {config.typeOptions.map((opt) => (
                    <label key={opt} className="flex items-center space-x-2 text-xs cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(opt)}
                        onChange={() => handleTypeToggle(opt)}
                        className="rounded text-brand-maroon focus:ring-brand-maroon"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Box Grid */}
            {config.sizeOptions && config.sizeOptions.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {config.sizeOptions.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeToggle(sz)}
                      className={`min-w-9 h-8 px-2 rounded-md text-xs font-semibold border transition-all ${
                        selectedSizes.includes(sz)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Slider with min/max values */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
              <div className="flex justify-between text-xs font-bold">
                <span>Price Range</span>
                <span className="text-brand-maroon">
                  Up to ₹{priceRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={config.priceMin || 499}
                max={config.priceMax || 15000}
                step={250}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-maroon cursor-pointer"
              />
              <div className="flex justify-between text-[11px] opacity-60">
                <span>₹{(config.priceMin || 499).toLocaleString('en-IN')}</span>
                <span>₹{(config.priceMax || 15000).toLocaleString('en-IN')}+</span>
              </div>
            </div>

            {/* Color Palette Swatches */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
              <h4 className="text-xs font-bold uppercase tracking-wider">Color</h4>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColors(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name]);
                    }}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border transition-transform relative ${
                      selectedColors.includes(c.name)
                        ? 'scale-120 ring-2 ring-brand-maroon border-white'
                        : 'border-neutral-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColors.includes(c.name) && (
                      <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabrics Checkboxes */}
            {config.fabricOptions && config.fabricOptions.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Fabric</h4>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {config.fabricOptions.map((fb) => (
                    <label key={fb} className="flex items-center space-x-2 text-xs cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={selectedFabrics.includes(fb)}
                        onChange={() => handleFabricToggle(fb)}
                        className="rounded text-brand-maroon focus:ring-brand-maroon"
                      />
                      <span>{fb}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Occasion Checkboxes */}
            {config.occasionOptions && (
              <div className="space-y-2 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Occasion</h4>
                <div className="space-y-1.5">
                  {config.occasionOptions.map((oc) => (
                    <label key={oc} className="flex items-center space-x-2 text-xs cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={selectedOccasions.includes(oc)}
                        onChange={() => handleOccasionToggle(oc)}
                        className="rounded text-brand-maroon focus:ring-brand-maroon"
                      />
                      <span>{oc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Checkboxes for Suits */}
            {config.hasAvailabilityFilter && (
              <div className="space-y-2 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Availability</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-brand-maroon focus:ring-brand-maroon"
                    />
                    <span>In Stock</span>
                  </label>
                </div>
              </div>
            )}
          </aside>

          {/* PRODUCT GRID */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-2xl h-96 animate-pulse border bg-white border-neutral-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border bg-white border-brand-border space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto flex items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-serif text-lg font-bold">No matching products found</h3>
                <p className="text-xs opacity-75 max-w-sm mx-auto">
                  Try clearing some filters to explore our full atelier catalog.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-brand-maroon-hover"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Products 3-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6 border-t border-brand-border">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                      const isCurrent = pagination.page === p;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('page', p);
                            setSearchParams(newParams);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-neutral-900 text-white shadow-md'
                              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>



      {/* 6. MOBILE FILTERS SLIDE-OVER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-xs h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between bg-white text-neutral-900">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/30">
                <span className="font-serif font-bold text-base">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 opacity-70 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Types */}
              {config.typeOptions && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">{config.typeFilterTitle}</h4>
                  <div className="space-y-1.5">
                    {config.typeOptions.map(opt => (
                      <label key={opt} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(opt)}
                          onChange={() => handleTypeToggle(opt)}
                          className="text-brand-maroon rounded"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {config.sizeOptions && config.sizeOptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {config.sizeOptions.map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleSizeToggle(sz)}
                        className={`min-w-8 h-8 px-2 rounded text-xs font-semibold border ${
                          selectedSizes.includes(sz)
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-50 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold uppercase mb-2">Price: Up to ₹{priceRange.toLocaleString('en-IN')}</h4>
                <input
                  type="range"
                  min={config.priceMin || 499}
                  max={config.priceMax || 15000}
                  step={250}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-maroon"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200/30 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-100"
              >
                Clear
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-brand-maroon-hover"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
