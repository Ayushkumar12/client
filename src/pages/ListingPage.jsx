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
  ArrowRight
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function ListingPage({ defaultCategory = null, isNewArrivals = false }) {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = isNewArrivals ? 'new-arrivals' : (categorySlug || defaultCategory || 'all');
  const searchParam = searchParams.get('search') || '';
  const subCategoryParam = searchParams.get('sub_category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState({ categories: [], fabrics: [], occasions: [] });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState(15000);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available Filter Options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colorOptions = [
    { name: 'Royal Blue', hex: '#1E3A8A' },
    { name: 'Deep Wine', hex: '#5A1827' },
    { name: 'Emerald Green', hex: '#065F46' },
    { name: 'Teal Blue', hex: '#0F766E' },
    { name: 'Pastel Pink', hex: '#F472B6' },
    { name: 'Ivory White', hex: '#FAF7F2' },
    { name: 'Antique Gold', hex: '#D4AF37' },
    { name: 'Midnight Black', hex: '#121212' },
  ];
  const fabricOptions = ['Georgette', 'Chanderi', 'Silk', 'Organza', 'Cotton', 'Velvet', 'Rayon', 'Net'];
  const occasionOptions = ['Wedding', 'Festive', 'Party Wear', 'Daily Wear', 'Casual'];
  const discountOptions = [
    { label: '10% and above', value: 10 },
    { label: '20% and above', value: 20 },
    { label: '30% and above', value: 30 },
    { label: '40% and above', value: 40 },
  ];

  // Subcategory pills for Suits
  const suitSubcategories = [
    'Anarkali Suits',
    'Straight Suits',
    'Sharara Suits',
    'Palazzo Suits',
    'Punjabi Suits',
    'Cotton Suits',
    'Unstitched Suits'
  ];

  useEffect(() => {
    fetchProducts();
  }, [
    currentCategory,
    subCategoryParam,
    searchParam,
    selectedSizes,
    selectedFabrics,
    selectedOccasions,
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
        category: currentCategory,
        sub_category: subCategoryParam,
        search: searchParam,
        max_price: priceRange < 15000 ? priceRange : undefined,
        size: selectedSizes.join(','),
        fabric: selectedFabrics.join(','),
        occasion: selectedOccasions.join(','),
        sort: sortBy,
        page,
        limit: 24,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products);
        setPagination(res.pagination);
        if (res.facets) setFacets(res.facets);
      }
    } catch (e) {
      console.error('Error fetching catalog:', e);
    } finally {
      setLoading(false);
    }
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
    setSelectedColors([]);
    setPriceRange(15000);
    setSelectedDiscount(null);
    setSortBy('featured');
    setSearchParams({});
  };

  // Titles and descriptions based on category
  const getPageMeta = () => {
    if (isNewArrivals) {
      return {
        title: 'New Arrivals | OCT9 Luxury Ethnic Wear',
        heading: 'New Arrivals',
        tagline: 'FRESH FROM OUR ATELIER',
        description: 'Discover the latest collection of premium ethnic wear crafted for your special moments.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
      };
    }
    if (currentCategory === 'designer-suits') {
      return {
        title: 'Designer Suits | OCT9 Royal Atelier',
        heading: 'Designer Suits',
        tagline: 'LUXURY ETHNIC ATELIER',
        description: 'Exquisite hand-embroidered bespoke suits tailored for royalty and special celebrations.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
      };
    }
    if (currentCategory === 'suits') {
      return {
        title: 'Suits & Salwar Sets | OCT9 Elegance',
        heading: 'Suits',
        tagline: 'TIMELESS DRAPES & CRAFT',
        description: 'A perfect blend of tradition and contemporary elegance.',
        image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85'
      };
    }
    if (currentCategory === 'sarees') {
      return {
        title: 'Designer Sarees | OCT9 Luxury',
        heading: 'Designer Sarees',
        tagline: 'HANDLOOM & ORGANZA',
        description: 'Tradition with a Modern Touch - Organza, Pure Silk & Georgette Drapes.',
        image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=1200&q=85'
      };
    }
    return {
      title: `${currentCategory.replace('-', ' ').toUpperCase()} | OCT9`,
      heading: currentCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      tagline: 'OCT9 COLLECTION',
      description: 'Explore handcrafted luxury ethnic wear created with passion.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    };
  };

  const meta = getPageMeta();
  const activeFiltersCount = selectedSizes.length + selectedFabrics.length + selectedOccasions.length + (priceRange < 15000 ? 1 : 0) + (selectedDiscount ? 1 : 0);

  return (
    <div className="pb-16 bg-[#FAF7F2]">
      <SEO
        title={meta.title}
        description={meta.description}
      />

      {/* 1. Header Banner matching Screenshots 2, 3, 4 */}
      <section className="bg-[#FAF7F2] border-b border-brand-border py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#F5ECE1] to-[#E9DEC9] border border-brand-border p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <span className="text-[11px] font-bold text-brand-maroon uppercase tracking-widest flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{meta.tagline}</span>
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                {meta.heading}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                {meta.description}
              </p>

              {/* Breadcrumbs */}
              <div className="pt-2 flex items-center space-x-2 text-xs text-neutral-500">
                <Link to="/" className="hover:text-brand-maroon">Home</Link>
                <span>/</span>
                <span className="text-neutral-900 font-semibold capitalize">{meta.heading}</span>
              </div>
            </div>

            <div className="hidden md:block w-72 h-44 rounded-xl overflow-hidden shadow-md border border-white/60">
              <img src={meta.image} alt={meta.heading} className="w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* Subcategory Rounded Pills selector matching Screenshot 3 & 4 */}
          {(currentCategory === 'suits' || currentCategory === 'designer-suits') && (
            <div className="mt-6 flex items-center space-x-3 overflow-x-auto no-scrollbar py-2">
              <Link
                to={`/category/${currentCategory}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  !subCategoryParam
                    ? 'bg-brand-maroon text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:border-brand-maroon'
                }`}
              >
                All {meta.heading}
              </Link>
              {suitSubcategories.map((sub) => (
                <Link
                  key={sub}
                  to={`/category/${currentCategory}?sub_category=${encodeURIComponent(sub)}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    subCategoryParam === sub
                      ? 'bg-brand-maroon text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:border-brand-maroon'
                  }`}
                >
                  {sub}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Main Content Layout: Left Sidebar Filters + Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between pb-6 border-b border-brand-border">
          {/* Total count */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 bg-white border border-neutral-300 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-brand-maroon" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
            <p className="text-xs sm:text-sm text-neutral-600">
              Showing <strong className="text-neutral-900">{pagination.total}</strong> products
            </p>
          </div>

          {/* Sort By Dropdown matching screenshots */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-neutral-500 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:border-brand-maroon shadow-2xs font-medium cursor-pointer"
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8 items-start">
          {/* LEFT SIDEBAR FILTERS (Desktop) matching Screenshots 2, 3, 4 */}
          <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-brand-border/80 shadow-2xs sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-maroon" />
                <span className="font-serif font-bold text-sm text-neutral-900">Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-brand-maroon hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Size Filter Pills */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`w-9 h-8 rounded-md text-xs font-semibold border transition-all ${
                      selectedSizes.includes(sz)
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-100">
              <div className="flex justify-between text-xs font-bold text-neutral-800">
                <span>Price Range</span>
                <span className="text-brand-maroon font-semibold">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={999}
                max={15000}
                step={500}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-maroon cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>₹999</span>
                <span>₹15,000+</span>
              </div>
            </div>

            {/* Color Swatches Palette */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Color Palette</h4>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColors(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name]);
                    }}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border transition-transform relative ${
                      selectedColors.includes(c.name) ? 'scale-120 ring-2 ring-neutral-900 border-white' : 'border-neutral-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColors.includes(c.name) && (
                      <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Checkboxes */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Fabric</h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {fabricOptions.map((fb) => (
                  <label key={fb} className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer hover:text-brand-maroon">
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

            {/* Occasion Checkboxes */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Occasion</h4>
              <div className="space-y-1.5">
                {occasionOptions.map((oc) => (
                  <label key={oc} className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer hover:text-brand-maroon">
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

            {/* Discount Checkboxes */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Discount</h4>
              <div className="space-y-1.5">
                {discountOptions.map((d) => (
                  <label key={d.value} className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer hover:text-brand-maroon">
                    <input
                      type="radio"
                      name="discount"
                      checked={selectedDiscount === d.value}
                      onChange={() => setSelectedDiscount(d.value)}
                      className="text-brand-maroon focus:ring-brand-maroon"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID (Right 3 columns on desktop, 4-col responsive layout) */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white rounded-xl h-84 animate-pulse border border-neutral-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-cream mx-auto flex items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-neutral-800">No matching products found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to discover our other handcrafted pieces.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls matching screenshot bottom */}
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
                            window.scrollTo({ top: 200, behavior: 'smooth' });
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

      {/* Mobile Filters Slide-over Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
                <span className="font-serif font-bold text-base text-neutral-900">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sizes */}
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(sz => (
                    <button
                      key={sz}
                      onClick={() => handleSizeToggle(sz)}
                      className={`w-8 h-8 rounded text-xs font-semibold border ${
                        selectedSizes.includes(sz) ? 'bg-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase mb-2">Fabric</h4>
                <div className="space-y-1">
                  {fabricOptions.map(fb => (
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
            </div>

            <div className="pt-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-neutral-300 rounded-lg"
              >
                Clear
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-lg"
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
