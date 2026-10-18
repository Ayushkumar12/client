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
import { ProductGridSkeleton } from '../components/common/Skeleton.jsx';
import { ComingSoonPage } from '../components/common/ComingSoonPage.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { api } from '../services/api.js';

// Standard Apparel & Footwear Size Ordering
const STANDARD_SIZE_ORDER = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL',
  'Free Size', 'Unstitched', 'Unstitched (Free Size)',
  '34', '35', '36', '37', '38', '39', '40', '41', '42', '43'
];

// Color Name to Hex Mapping for Curated Swatches
const COLOR_HEX_MAP = {
  black: '#121212',
  white: '#FFFFFF',
  ivory: '#FAF7F2',
  beige: '#E5D5C5',
  gold: '#D4AF37',
  golden: '#D4AF37',
  pink: '#F472B6',
  'blush pink': '#F472B6',
  red: '#DC2626',
  'crimson red': '#991B1B',
  maroon: '#800000',
  wine: '#5A1827',
  'deep wine': '#5A1827',
  green: '#16A34A',
  'emerald green': '#065F46',
  blue: '#2563EB',
  'royal blue': '#1E3A8A',
  navy: '#0F172A',
  'navy blue': '#0F172A',
  yellow: '#EAB308',
  mustard: '#CA8A04',
  orange: '#F97316',
  rust: '#C2410C',
  peach: '#FDBA74',
  purple: '#9333EA',
  lavender: '#C084FC',
  mint: '#A7F3D0',
  'mint seafoam': '#A7F3D0',
  silver: '#E2E8F0',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  brown: '#78350F',
  teal: '#0D9488',
  coral: '#FB7185',
  magenta: '#D946EF'
};

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
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const featuredParam = searchParams.get('featured') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Dynamic Available Filters present in the current category products
  const [availableFilters, setAvailableFilters] = useState({
    subCategories: [],
    sizes: [],
    fabrics: [],
    occasions: [],
    colors: [],
    minPrice: 0,
    maxPrice: 15000,
    hasInStockVariation: false,
    loaded: false
  });

  // Selected Filters state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState(fabricParam ? [fabricParam] : []);
  const [selectedOccasions, setSelectedOccasions] = useState(occasionParam ? [occasionParam] : []);
  const [selectedTypes, setSelectedTypes] = useState(subCategoryParam ? [subCategoryParam] : []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(() => (maxPriceParam ? Number(maxPriceParam) : 15000));
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // Specific configuration definitions per category
  const getCategoryConfig = () => {
    if (isDesignerSuits) {
      return {
        title: 'Designer Suits',
        heading: 'Designer Suits',
        tagline: 'PREMIUM DESIGNER WEAR',
        description: 'Exquisite hand-embroidered suits crafted for weddings, parties, and special celebrations.',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        badges: ['Premium Fabrics', 'Exclusive Designs', 'Wedding & Festive Ready'],
        theme: 'maroon_gold',
        typeFilterTitle: 'Suit Type'
      };
    }

    if (isUnstitchedSuits) {
      return {
        title: 'Unstitched Suits',
        heading: 'Unstitched Suits',
        tagline: 'PREMIUM UNSTITCHED FABRIC',
        description: 'Premium unstitched 3-piece suit fabrics in rich cotton, mulberry silk, and roman silk.',
        heroImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        badges: ['100% Pure Fabrics', 'Custom Stitching Freedom', 'Unstitched 3-Piece Sets'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Fabric Type'
      };
    }

    if (isStitchedSuits) {
      return {
        title: 'Stitched Suits',
        heading: 'Stitched Suits',
        tagline: 'READY-TO-WEAR SUIT SETS',
        description: 'Perfectly tailored ethnic suits ready for your grand celebrations and everyday charm.',
        heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        badges: ['Ready to Wear', 'Precision Tailoring', 'Wide Range of Sizes'],
        theme: 'dark_burgundy',
        typeFilterTitle: 'Suit Style'
      };
    }

    if (isNewArrivalsPage) {
      return {
        title: 'New Arrivals',
        heading: 'New Arrivals',
        tagline: 'FRESH NEW DESIGNS',
        description: 'Discover the latest collection of premium ethnic wear crafted for your special moments.',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        badges: ['Latest Designs', 'Premium Quality', 'Limited Stock'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Category'
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
        typeFilterTitle: 'Accessory Type'
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
        typeFilterTitle: 'Jutti Type'
      };
    }

    if (isSaree) {
      return {
        title: 'Sarees',
        heading: 'Sarees',
        tagline: 'ROYAL HERITAGE DRAPES',
        description: 'Charming flowing drapes for every festive occasion.',
        heroImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
        badges: ['Employed Fabrics', 'Free Shipping Above ₹1,999', 'Easy Returns 7 Days Free Return'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Saree Type'
      };
    }

    if (isPartyWear) {
      return {
        title: 'Party Wear',
        heading: 'Party Wear',
        tagline: 'PARTY WEAR & EVENING DRESSES',
        description: 'Dazzling sequin, velvet, and ethnic party wear crafted for parties and festive occasions.',
        heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85',
        badges: ['Handcrafted Embellishments', 'Premium Velvets & Silks', 'Free Shipping Above ₹1,999'],
        theme: 'cream_luxury',
        typeFilterTitle: 'Occasion Type'
      };
    }

    if (isFestiveWear) {
      return {
        title: 'Festive Wear',
        heading: 'Festive Wear',
        tagline: 'FESTIVE COLLECTION',
        description: 'Celebrate every festival in style with our rich ethnic collection.',
        heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        badges: ['Premium Fabrics', 'Exclusive Designs', 'Festive Season Collection'],
        theme: 'maroon_gold',
        typeFilterTitle: 'Festival'
      };
    }

    // Default fallback
    return {
      title: currentCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      heading: 'All Collections',
      tagline: 'PREMIUM ETHNIC COLLECTION',
      description: 'A perfect blend of tradition and contemporary elegance tailored for your special celebrations.',
      heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      badges: ['Handcrafted Designs', 'Premium Quality', 'Free Shipping Above ₹1,999'],
      theme: 'cream_luxury',
      typeFilterTitle: 'Type'
    };
  };

  const config = getCategoryConfig();
  if (pageAvailability?.title) {
    config.heading = pageAvailability.title;
    config.title = pageAvailability.title;
  }
  if (pageAvailability?.teaser) {
    config.description = pageAvailability.teaser;
  }

  const isUnavailable = Boolean(pageAvailability && pageAvailability.status && pageAvailability.status !== 'active');

  // Reset selected filters whenever category changes so filters from another category don't bleed over
  useEffect(() => {
    setSelectedSizes([]);
    setSelectedFabrics(fabricParam ? [fabricParam] : []);
    setSelectedOccasions(occasionParam ? [occasionParam] : []);
    setSelectedTypes(subCategoryParam ? [subCategoryParam] : []);
    setSelectedColors([]);
    setInStockOnly(false);
  }, [currentCategory]);

  // Dynamically extract only the filter options present in products belonging to the current page category
  useEffect(() => {
    if (isUnavailable) return;
    let isMounted = true;

    async function loadCategoryFacets() {
      try {
        const params = {
          category: currentCategory === 'all' || currentCategory === 'new-arrivals' ? undefined : currentCategory,
          new_arrival: isNewArrivalsPage ? 'true' : undefined,
          limit: 100
        };
        const res = await api.getProducts(params);
        if (res.success && res.products && isMounted) {
          const prods = res.products;

          // 1. Sub-categories
          const subCatSet = new Set();
          prods.forEach(p => {
            if (p.sub_category && typeof p.sub_category === 'string') {
              const trimmed = p.sub_category.trim();
              if (trimmed) subCatSet.add(trimmed);
            }
          });
          const subCats = Array.from(subCatSet).sort();

          // 2. Sizes
          const sizeSet = new Set();
          prods.forEach(p => {
            let pSizes = p.sizes;
            if (typeof pSizes === 'string') {
              try { pSizes = JSON.parse(pSizes); } catch (e) { pSizes = [pSizes]; }
            }
            if (Array.isArray(pSizes)) {
              pSizes.forEach(s => {
                if (!s) return;
                const str = (typeof s === 'object' ? (s.size || s.name || '') : String(s)).trim();
                if (str) sizeSet.add(str);
              });
            }
          });
          const sortedSizes = Array.from(sizeSet).sort((a, b) => {
            const idxA = STANDARD_SIZE_ORDER.indexOf(a);
            const idxB = STANDARD_SIZE_ORDER.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true });
          });

          // 3. Fabrics
          const fabricSet = new Set();
          prods.forEach(p => {
            if (p.fabric && typeof p.fabric === 'string') {
              p.fabric.split(',').forEach(f => {
                const trimmed = f.trim();
                if (trimmed) fabricSet.add(trimmed);
              });
            }
          });
          const sortedFabrics = Array.from(fabricSet).sort();

          // 4. Occasions
          const occasionSet = new Set();
          prods.forEach(p => {
            if (p.occasion && typeof p.occasion === 'string') {
              p.occasion.split(',').forEach(o => {
                const trimmed = o.trim();
                if (trimmed) occasionSet.add(trimmed);
              });
            }
          });
          const sortedOccasions = Array.from(occasionSet).sort();

          // 5. Colors
          const colorMap = new Map();
          prods.forEach(p => {
            let pColors = p.colors;
            if (typeof pColors === 'string') {
              try { pColors = JSON.parse(pColors); } catch (e) { pColors = [pColors]; }
            }
            if (Array.isArray(pColors)) {
              pColors.forEach(c => {
                if (!c) return;
                const name = typeof c === 'object' ? (c.name || c.color || '') : String(c).trim();
                const hex = typeof c === 'object' ? (c.hex || '') : '';
                if (name && !colorMap.has(name)) {
                  colorMap.set(name, hex || COLOR_HEX_MAP[name.toLowerCase()] || (name.startsWith('#') ? name : '#737373'));
                }
              });
            }
          });
          const colorList = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

          // 6. Prices
          const validPrices = prods.map(p => Number(p.price)).filter(pr => !isNaN(pr) && pr > 0);
          const minP = validPrices.length > 0 ? Math.floor(Math.min(...validPrices)) : 0;
          const maxP = validPrices.length > 0 ? Math.ceil(Math.max(...validPrices)) : 15000;

          // 7. Stock variation
          const hasInStock = prods.some(p => Number(p.stock) > 0);
          const hasOutOfStock = prods.some(p => Number(p.stock) <= 0);

          setAvailableFilters({
            subCategories: subCats,
            sizes: sortedSizes,
            fabrics: sortedFabrics,
            occasions: sortedOccasions,
            colors: colorList,
            minPrice: minP,
            maxPrice: maxP,
            hasInStockVariation: hasInStock && hasOutOfStock,
            loaded: true
          });

          if (!maxPriceParam) {
            setPriceRange(maxP);
          }
        }
      } catch (err) {
        console.error('Error fetching category facets:', err);
      }
    }

    loadCategoryFacets();
    return () => { isMounted = false; };
  }, [currentCategory, isNewArrivalsPage, isUnavailable]);

  useEffect(() => {
    if (isUnavailable) return;
    fetchProducts();
  }, [
    isUnavailable,
    currentCategory,
    subCategoryParam,
    searchParam,
    minPriceParam,
    maxPriceParam,
    featuredParam,
    selectedSizes,
    selectedFabrics,
    selectedOccasions,
    selectedTypes,
    selectedColors,
    inStockOnly,
    priceRange,
    selectedDiscount,
    sortBy,
    searchParams.get('page')
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const effectiveMaxPrice = maxPriceParam
        ? Number(maxPriceParam)
        : (availableFilters.loaded && availableFilters.maxPrice > availableFilters.minPrice && priceRange < availableFilters.maxPrice ? priceRange : undefined);
      const params = {
        category: currentCategory === 'all' || currentCategory === 'new-arrivals' ? undefined : currentCategory,
        new_arrival: isNewArrivalsPage ? 'true' : undefined,
        featured: (featuredParam === 'true' || featuredParam === '1') ? 'true' : undefined,
        sub_category: selectedTypes.length > 0 ? selectedTypes.join(',') : (subCategoryParam || undefined),
        search: searchParam || undefined,
        min_price: minPriceParam ? Number(minPriceParam) : undefined,
        max_price: effectiveMaxPrice,
        size: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
        fabric: selectedFabrics.length > 0 ? selectedFabrics.join(',') : undefined,
        occasion: selectedOccasions.length > 0 ? selectedOccasions.join(',') : undefined,
        color: selectedColors.length > 0 ? selectedColors.join(',') : undefined,
        in_stock: inStockOnly ? 'true' : undefined,
        sort: sortBy,
        page,
        limit: 24,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        let list = res.products || [];

        // Safeguard for inStockOnly
        if (inStockOnly) {
          list = list.filter(p => Number(p.stock) > 0);
        }

        // Safeguard for selectedColors
        if (selectedColors.length > 0) {
          list = list.filter(p => {
            let pColors = p.colors;
            if (typeof pColors === 'string') {
              try { pColors = JSON.parse(pColors); } catch (e) { pColors = [pColors]; }
            }
            const colorNames = Array.isArray(pColors)
              ? pColors.map(c => (typeof c === 'object' ? (c.name || '') : String(c)).toLowerCase())
              : [];
            const titleLower = (p.title || '').toLowerCase();
            return selectedColors.some(sc => {
              const scLower = sc.toLowerCase();
              return colorNames.includes(scLower) || titleLower.includes(scLower);
            });
          });
        }

        // Safeguard for client price slider
        if (availableFilters.loaded && availableFilters.maxPrice > availableFilters.minPrice && priceRange < availableFilters.maxPrice) {
          list = list.filter(p => Number(p.price) <= priceRange);
        }

        setProducts(list);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: list.length });
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

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedTypes([]);
    setSelectedColors([]);
    setPriceRange(availableFilters.maxPrice || 15000);
    setSelectedDiscount(null);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const isPriceFiltered = availableFilters.loaded && availableFilters.maxPrice > availableFilters.minPrice && priceRange < availableFilters.maxPrice;
  const activeFiltersCount =
    selectedSizes.length +
    selectedFabrics.length +
    selectedOccasions.length +
    selectedTypes.length +
    selectedColors.length +
    (inStockOnly ? 1 : 0) +
    (isPriceFiltered ? 1 : 0) +
    (selectedDiscount ? 1 : 0);

  const hasAnyFilters =
    availableFilters.subCategories.length > 0 ||
    availableFilters.sizes.length > 0 ||
    availableFilters.fabrics.length > 0 ||
    availableFilters.occasions.length > 0 ||
    availableFilters.colors.length > 0 ||
    (availableFilters.maxPrice > availableFilters.minPrice) ||
    availableFilters.hasInStockVariation;

  // Cohesive Brand Theme Classes
  const pageBgClass = 'bg-[#FAF7F2] text-neutral-900';
  const sidebarBgClass = 'bg-white border-brand-border text-neutral-800';

  // If the category is marked as Coming Soon or Maintenance by Admin, render the ComingSoonPage
  if (isUnavailable) {
    return <ComingSoonPage categorySlug={currentCategory} pageInfo={pageAvailability} />;
  }

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
              <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
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
              <span key={idx} className="bg-brand-cream/90 text-brand-maroon font-semibold px-2.5 py-1 rounded-sm border border-brand-border text-[11px]">
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
              className="lg:hidden flex items-center space-x-2 px-3 py-2 rounded-sm text-xs font-semibold shadow-xs border bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50"
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
              className="text-xs sm:text-sm rounded-sm px-3 py-2 font-medium cursor-pointer shadow-2xs border bg-white text-neutral-800 border-neutral-300 focus:outline-none focus:border-brand-maroon"
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
          <aside className={`hidden lg:block space-y-6 p-5 rounded-sm border shadow-2xs sticky top-28 ${sidebarBgClass}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/40">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-maroon" />
                <span className="font-sans font-bold text-sm">Filters</span>
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

            {!hasAnyFilters && availableFilters.loaded && (
              <div className="py-4 text-xs text-neutral-500">
                All {pagination.total} styles are shown.
              </div>
            )}

            {/* Category / Subcategory Type Checkboxes */}
            {availableFilters.subCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">{config.typeFilterTitle}</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableFilters.subCategories.map((opt) => (
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
            {availableFilters.sizes.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.sizes.map((sz) => (
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
            {availableFilters.maxPrice > availableFilters.minPrice && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
                <div className="flex justify-between text-xs font-bold">
                  <span>Price Range</span>
                  <span className="text-brand-maroon">
                    Up to ₹{priceRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={availableFilters.minPrice}
                  max={availableFilters.maxPrice}
                  step={Math.max(10, Math.floor((availableFilters.maxPrice - availableFilters.minPrice) / 20))}
                  value={Math.min(Math.max(priceRange, availableFilters.minPrice), availableFilters.maxPrice)}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-maroon cursor-pointer"
                />
                <div className="flex justify-between text-[11px] opacity-60">
                  <span>₹{availableFilters.minPrice.toLocaleString('en-IN')}</span>
                  <span>₹{availableFilters.maxPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Color Palette Swatches */}
            {availableFilters.colors.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Color</h4>
                <div className="flex flex-wrap gap-2.5">
                  {availableFilters.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorToggle(c.name)}
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
            )}

            {/* Fabrics Checkboxes */}
            {availableFilters.fabrics.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Fabric</h4>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {availableFilters.fabrics.map((fb) => (
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
            {availableFilters.occasions.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-neutral-200/30">
                <h4 className="text-xs font-bold uppercase tracking-wider">Occasion</h4>
                <div className="space-y-1.5">
                  {availableFilters.occasions.map((oc) => (
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
            {availableFilters.hasInStockVariation && (
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
              <ProductGridSkeleton count={9} />
            ) : products.length === 0 ? (
              <div className="p-12 text-center rounded-sm border bg-white border-brand-border space-y-4">
                <div className="w-14 h-14 rounded-sm bg-neutral-100 mx-auto flex items-center justify-center">
                  <SlidersHorizontal className="w-7 h-7 text-neutral-400" />
                </div>
                <h3 className="font-sans text-lg font-bold">No matching products found</h3>
                <p className="text-xs opacity-75 max-w-sm mx-auto">
                  Try clearing some filters to explore our full product collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-sm shadow-sm hover:bg-brand-maroon-hover transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Products 2-Col Mobile / 3-Col Desktop Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-1.5 pt-6 border-t border-brand-border">
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
                          className={`w-8 h-8 rounded-sm text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-neutral-900 text-white shadow-xs'
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
                <span className="font-sans font-bold text-base">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 opacity-70 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!hasAnyFilters && availableFilters.loaded && (
                <div className="py-6 text-center text-xs text-neutral-500">
                  All styles in this collection are currently shown.
                </div>
              )}

              {/* Types */}
              {availableFilters.subCategories.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">{config.typeFilterTitle}</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availableFilters.subCategories.map(opt => (
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
              {availableFilters.sizes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.sizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleSizeToggle(sz)}
                        className={`min-w-8 h-8 px-2 rounded-sm text-xs font-semibold border ${
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
              {availableFilters.maxPrice > availableFilters.minPrice && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Price: Up to ₹{priceRange.toLocaleString('en-IN')}</h4>
                  <input
                    type="range"
                    min={availableFilters.minPrice}
                    max={availableFilters.maxPrice}
                    step={Math.max(10, Math.floor((availableFilters.maxPrice - availableFilters.minPrice) / 20))}
                    value={Math.min(Math.max(priceRange, availableFilters.minPrice), availableFilters.maxPrice)}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-brand-maroon"
                  />
                  <div className="flex justify-between text-[11px] opacity-60 mt-1">
                    <span>₹{availableFilters.minPrice.toLocaleString('en-IN')}</span>
                    <span>₹{availableFilters.maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Colors */}
              {availableFilters.colors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => handleColorToggle(c.name)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full border transition-transform relative ${
                          selectedColors.includes(c.name)
                            ? 'scale-120 ring-2 ring-brand-maroon border-white'
                            : 'border-neutral-300'
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
              )}

              {/* Fabrics */}
              {availableFilters.fabrics.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Fabric</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availableFilters.fabrics.map(fb => (
                      <label key={fb} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fb)}
                          onChange={() => handleFabricToggle(fb)}
                          className="text-brand-maroon rounded"
                        />
                        <span>{fb}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasions */}
              {availableFilters.occasions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Occasion</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availableFilters.occasions.map(oc => (
                      <label key={oc} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedOccasions.includes(oc)}
                          onChange={() => handleOccasionToggle(oc)}
                          className="text-brand-maroon rounded"
                        />
                        <span>{oc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {availableFilters.hasInStockVariation && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Availability</h4>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="text-brand-maroon rounded"
                      />
                      <span>In Stock</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200/30 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-neutral-300 rounded-sm hover:bg-neutral-100"
              >
                Clear
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-sm shadow-sm hover:bg-brand-maroon-hover"
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
