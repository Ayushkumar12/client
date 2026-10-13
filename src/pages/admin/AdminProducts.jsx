import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  Star,
  Loader2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ImageUploader } from '../../components/common/ImageUploader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export function AdminProducts() {
  const { showPublicRatings, refreshSettings } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingRatings, setTogglingRatings] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hex: '#5A1827', image: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    category_slug: 'stitched-suits',
    sub_category: '',
    fabric: '',
    occasion: '',
    sku: '',
    stock: '',
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    sections: [],
    images: [],
    sizes: [],
    colors: []
  });

  const ALL_CATEGORIES = [
    { value: 'stitched-suits', label: 'Stitched Suits' },
    { value: 'unstitched-suits', label: 'Unstitched Suits' },
    { value: 'designer-suits', label: 'Designer Suits' },
    { value: 'sarees', label: 'Sarees' },
    { value: 'salwar-sets', label: 'Salwar Sets' },
    { value: 'festive-wear', label: 'Festive Wear' },
    { value: 'party-wear', label: 'Party Wear' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'jutti', label: 'Jutti' },
  ];

  const SECTION_TAGS = [
    { key: 'is_new_arrival', label: 'New Arrival' },
    { key: 'is_featured', label: 'Featured Collection' },
    { key: 'is_bestseller', label: 'Bestseller' },
    { key: 'section_party', label: 'Party Picks' },
    { key: 'section_festive', label: 'Festive Special' },
    { key: 'section_sale', label: 'On Sale' },
    { key: 'section_editorial', label: 'Editorial' },
    { key: 'section_trending', label: 'Trending Now' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({ category: selectedCategory, search, limit: 100 });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  // Size management helpers
  const toggleSize = (sz) => {
    const current = formData.sizes || [];
    if (current.includes(sz)) {
      setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== sz) }));
    } else {
      setFormData(prev => ({ ...prev, sizes: [...(prev.sizes || []), sz] }));
    }
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const clean = customSizeInput.trim();
    if (!clean) return;
    const current = formData.sizes || [];
    if (!current.includes(clean)) {
      setFormData(prev => ({ ...prev, sizes: [...(prev.sizes || []), clean] }));
    }
    setCustomSizeInput('');
  };

  const removeSize = (sz) => {
    setFormData(prev => ({ ...prev, sizes: (prev.sizes || []).filter(s => s !== sz) }));
  };

  const applySizePreset = (presetKey) => {
    if (presetKey === 'clear') {
      setFormData(prev => ({ ...prev, sizes: [] }));
    } else if (presetKey === 'standard') {
      setFormData(prev => ({ ...prev, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }));
    } else if (presetKey === 'unstitched') {
      setFormData(prev => ({ ...prev, sizes: ['Unstitched'] }));
    } else if (presetKey === 'freesize') {
      setFormData(prev => ({ ...prev, sizes: ['Free Size'] }));
    } else if (presetKey === 'footwear') {
      setFormData(prev => ({ ...prev, sizes: ['36', '37', '38', '39', '40', '41'] }));
    }
  };

  // Color management helpers
  const handleAddColor = () => {
    const cleanName = (newColor.name || '').trim();
    if (!cleanName) {
      alert('Please enter a color name (e.g. Wine Red, Emerald Green).');
      return;
    }
    const colorObj = {
      name: cleanName,
      hex: (newColor.hex || '#1E1E1E').trim(),
      ...(newColor.image ? { image: newColor.image.trim() } : {})
    };
    setFormData(prev => ({
      ...prev,
      colors: [...(prev.colors || []), colorObj]
    }));
    setNewColor({ name: '', hex: '#5A1827', image: '' });
  };

  const removeColor = (idx) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== idx)
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setCustomSizeInput('');
    setNewColor({ name: '', hex: '#5A1827', image: '' });
    setFormData({
      title: '',
      description: '',
      short_description: '',
      price: '',
      original_price: '',
      category_slug: 'stitched-suits',
      sub_category: '',
      fabric: '',
      occasion: '',
      sku: `OCT-${Date.now().toString().slice(-4)}`,
      stock: '',
      is_featured: false,
      is_new_arrival: false,
      is_bestseller: false,
      sections: [],
      images: [],
      sizes: [],
      colors: []
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setCustomSizeInput('');
    setNewColor({ name: '', hex: '#5A1827', image: '' });
    let parsedSizes = ['S', 'M', 'L', 'XL'];
    if (Array.isArray(p.sizes)) {
      parsedSizes = p.sizes;
    } else if (typeof p.sizes === 'string') {
      try {
        parsedSizes = JSON.parse(p.sizes);
      } catch (e) {
        parsedSizes = p.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    let parsedColors = [];
    if (Array.isArray(p.colors)) {
      parsedColors = p.colors;
    } else if (typeof p.colors === 'string') {
      try {
        parsedColors = JSON.parse(p.colors);
      } catch (e) {
        parsedColors = [];
      }
    }

    setFormData({
      title: p.title,
      description: p.description,
      short_description: p.short_description || '',
      price: p.price,
      original_price: p.original_price,
      category_slug: p.category_slug,
      sub_category: p.sub_category || '',
      fabric: p.fabric || '',
      occasion: p.occasion || '',
      sku: p.sku || '',
      stock: p.stock,
      is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival,
      is_bestseller: p.is_bestseller,
      sections: p.sections || [],
      images: Array.isArray(p.images) ? p.images : [],
      sizes: parsedSizes,
      colors: parsedColors
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sizes || formData.sizes.length === 0) {
      alert('Please select or add at least one size for this product.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRatings = async () => {
    setTogglingRatings(true);
    try {
      const nextVal = !showPublicRatings;
      const res = await api.togglePublicRatings(nextVal);
      if (res.success) {
        await refreshSettings();
        await fetchProducts();
      }
    } catch (e) {
      alert('Failed to toggle ratings: ' + e.message);
    } finally {
      setTogglingRatings(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1-Click Storefront Ratings Control Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-neutral-900">Storefront Customer Ratings</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              showPublicRatings ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
            }`}>
              {showPublicRatings ? 'VISIBLE TO CUSTOMERS' : 'HIDDEN FROM CUSTOMERS'}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {showPublicRatings
              ? 'Customer ratings and star reviews are publicly visible on storefront product cards.'
              : 'Ratings are hidden on storefront for visitors. You can toggle visibility here anytime.'}
          </p>
        </div>

        <button
          onClick={handleToggleRatings}
          disabled={togglingRatings}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0 cursor-pointer ${
            showPublicRatings
              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white'
          }`}
        >
          {togglingRatings ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : showPublicRatings ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Ratings</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Ratings to Customers</span>
            </>
          )}
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Product Catalog
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage product inventory, pricing, sizing, fabrics, and customer ratings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['all', 'stitched-suits', 'unstitched-suits', 'designer-suits', 'sarees', 'festive-wear', 'party-wear', 'accessories', 'jutti'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        </form>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No products found. Click "+ Add New Product" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Item</th>
                  <th className="p-4">Category & Sub</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Ratings</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
                  const hasReviews = Number(p.reviews_count || 0) > 0 && Number(p.rating || 0) > 0;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img src={img} alt={p.title} className="w-12 h-14 object-cover rounded-lg bg-neutral-100" />
                          <div>
                            <p className="font-bold text-neutral-900 text-sm">{p.title}</p>
                            <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-neutral-900 capitalize block">{p.category_slug}</span>
                        <span className="text-[11px] text-neutral-500">{p.sub_category || 'General'}</span>
                        {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-[200px]">
                            {p.sizes.slice(0, 4).map((sz) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200"
                              >
                                {sz}
                              </span>
                            ))}
                            {p.sizes.length > 4 && (
                              <span className="text-[9px] text-neutral-400 font-medium">+{p.sizes.length - 4}</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-neutral-900 text-sm">₹{p.price}</span>
                        {p.original_price > p.price && (
                          <div className="text-[10px] text-neutral-400">
                            <span className="line-through">₹{p.original_price}</span>{' '}
                            <strong className="text-brand-maroon">{p.discount_percent}% OFF</strong>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>

                      <td className="p-4">
                        {hasReviews ? (
                          <div className="flex items-center space-x-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">({p.reviews_count})</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs font-normal">No reviews</span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-sm p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-sans font-bold text-lg text-neutral-900">
                {editingProduct ? 'Edit Product Style' : 'Add New Ethnic Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Embroidered Anarkali Suit"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Primary Category *</label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      let suggestedSizes = formData.sizes;
                      if (!editingProduct && (!formData.sizes || formData.sizes.length <= 4)) {
                        if (newCat === 'unstitched-suits') suggestedSizes = ['Unstitched'];
                        else if (newCat === 'sarees' || newCat === 'accessories') suggestedSizes = ['Free Size'];
                        else if (newCat === 'jutti') suggestedSizes = ['36', '37', '38', '39', '40', '41'];
                        else suggestedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                      }
                      setFormData({ ...formData, category_slug: newCat, sizes: suggestedSizes });
                    }}
                    className="w-full p-2.5 border rounded-lg capitalize"
                  >
                    {ALL_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Promotional Badges & Collections */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-2">Promotional Badges & Curations <span className="font-normal text-neutral-400 text-[11px]">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SECTION_TAGS.map(tag => {
                      const isFlag = ['is_new_arrival', 'is_featured', 'is_bestseller'].includes(tag.key);
                      const isActive = isFlag ? Boolean(formData[tag.key]) : (formData.sections || []).includes(tag.key);
                      return (
                        <button
                          key={tag.key}
                          type="button"
                          onClick={() => {
                            if (isFlag) {
                              setFormData({ ...formData, [tag.key]: !formData[tag.key] });
                            } else {
                              const cur = formData.sections || [];
                              setFormData({
                                ...formData,
                                sections: isActive ? cur.filter(s => s !== tag.key) : [...cur, tag.key]
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          {isActive ? '✓ ' : ''}{tag.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                    Badges control product card stickers (e.g. New In, Bestseller), promotional filters, and curated collection edits.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="2399"
                    className="w-full p-2.5 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                    placeholder="3999"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Subcategory (e.g. Anarkali, Palazzo)</label>
                  <input
                    type="text"
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                    placeholder="Anarkali Suits"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Fabric & Occasion</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Fabric (e.g. Georgette)"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Occasion (e.g. Wedding)"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="OCT-ANK-001"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              {/* Product Sizes Section */}
              <div className="border border-neutral-200 bg-neutral-50/70 p-4 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-neutral-900 text-xs">
                      Product Sizes * <span className="font-normal text-neutral-500">({formData.sizes?.length || 0} active)</span>
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Configure sizes available for purchase on product cards and product details.
                    </p>
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="flex items-center flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => applySizePreset('standard')}
                      className="px-2 py-1 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-neutral-800 rounded border border-neutral-300 transition-colors cursor-pointer"
                    >
                      XS – XXL
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('unstitched')}
                      className="px-2 py-1 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-neutral-800 rounded border border-neutral-300 transition-colors cursor-pointer"
                    >
                      Unstitched
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('freesize')}
                      className="px-2 py-1 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-neutral-800 rounded border border-neutral-300 transition-colors cursor-pointer"
                    >
                      Free Size
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('footwear')}
                      className="px-2 py-1 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-neutral-800 rounded border border-neutral-300 transition-colors cursor-pointer"
                    >
                      Footwear (36–41)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('clear')}
                      className="px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Selected Active Sizes Chips */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                    Selected Sizes for this Product:
                  </span>
                  {formData.sizes && formData.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.sizes.map((sz) => (
                        <span
                          key={sz}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white rounded text-xs font-semibold"
                        >
                          <span>{sz}</span>
                          <button
                            type="button"
                            onClick={() => removeSize(sz)}
                            className="hover:text-red-300 focus:outline-none cursor-pointer"
                            title={`Remove size ${sz}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 font-medium bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                      ⚠️ No sizes selected. Please click sizes below or add a custom size.
                    </p>
                  )}
                </div>

                {/* Size Presets by Category */}
                <div className="space-y-2 pt-2 border-t border-neutral-200 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-neutral-500 sm:w-28 shrink-0">Apparel Sizes:</span>
                    <div className="flex flex-wrap gap-1">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'].map((sz) => {
                        const isSelected = (formData.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-800 text-white border-neutral-800'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-neutral-500 sm:w-28 shrink-0">Ethnic & Drapes:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Free Size', 'Unstitched', 'Semi-Stitched'].map((sz) => {
                        const isSelected = (formData.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-800 text-white border-neutral-800'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-neutral-500 sm:w-28 shrink-0">Footwear / Jutti:</span>
                    <div className="flex flex-wrap gap-1">
                      {['36', '37', '38', '39', '40', '41', '42'].map((sz) => {
                        const isSelected = (formData.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-800 text-white border-neutral-800'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Size Field */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 sm:w-28 shrink-0">Custom Size:</span>
                    <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSize();
                          }
                        }}
                        placeholder="Type size (e.g. 44, Tailored, One Size)..."
                        className="w-full p-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSize}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold rounded shrink-0 cursor-pointer"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <ImageUploader
                  images={formData.images}
                  onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                  multiple={true}
                  maxFiles={8}
                  label="Product Photos"
                  helperText="Upload multi-angle photos from your device."
                />
              </div>

              {/* Product Colors & Variant Images Section */}
              <div className="border border-neutral-200 bg-neutral-50/70 p-4 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-neutral-900 text-xs">
                      Product Colors &amp; Separate Images <span className="font-normal text-neutral-500">({formData.colors?.length || 0} active)</span>
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Add colors available for this product. You can link a separate image to each color so clicking the color on the product page switches to that photo.
                    </p>
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-neutral-500 mr-1">Quick Presets:</span>
                  {[
                    { name: 'Deep Wine', hex: '#5A1827' },
                    { name: 'Emerald Green', hex: '#065F46' },
                    { name: 'Royal Blue', hex: '#1E3A8A' },
                    { name: 'Mustard Gold', hex: '#D97706' },
                    { name: 'Rani Pink', hex: '#DB2777' },
                    { name: 'Rust Orange', hex: '#C2410C' },
                    { name: 'Ivory White', hex: '#FAF7F2' },
                    { name: 'Noir Black', hex: '#171717' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setNewColor(prev => ({ ...prev, name: preset.name, hex: preset.hex }))}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Active Colors List */}
                {formData.colors && formData.colors.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Active Colors for this Product:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-md shadow-2xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                className="w-8 h-8 rounded object-cover border border-neutral-300 shrink-0"
                              />
                            ) : (
                              <span
                                className="w-6 h-6 rounded border border-neutral-300 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">{c.name}</p>
                              <div className="flex items-center space-x-1.5 text-[10px] text-neutral-500">
                                <span>{c.hex}</span>
                                {c.image ? (
                                  <span className="text-emerald-700 font-semibold">• Dedicated Photo</span>
                                ) : (
                                  <span className="text-neutral-400">• Main Photo</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeColor(idx)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded cursor-pointer transition-colors shrink-0"
                            title={`Remove color ${c.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic bg-white p-2.5 rounded border border-neutral-200">
                    No custom colors configured. Add colors below if this product comes in different color variants.
                  </p>
                )}

                {/* Add New Color Form */}
                <div className="p-3 bg-white border border-neutral-200 rounded-md space-y-2.5">
                  <span className="text-[11px] font-bold text-neutral-900 block">
                    + Add Color Variant
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={newColor.name}
                        onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Color name (e.g. Wine Red)"
                        className="w-full p-1.5 text-xs border border-neutral-300 rounded focus:border-neutral-800"
                      />
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newColor.hex}
                        onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                        className="w-8 h-8 p-0 border border-neutral-300 rounded cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={newColor.hex}
                        onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                        placeholder="#5A1827"
                        className="w-full p-1.5 text-xs font-mono border border-neutral-300 rounded"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                      >
                        + Add Color
                      </button>
                    </div>
                  </div>

                  {/* Optional Color Image Picker */}
                  <div className="space-y-1.5 pt-1 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-neutral-700">
                        Separate Image for this Color (Optional):
                      </label>
                      {newColor.image && (
                        <button
                          type="button"
                          onClick={() => setNewColor(prev => ({ ...prev, image: '' }))}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={newColor.image}
                      onChange={(e) => setNewColor(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Paste image URL or click one from uploaded photos below..."
                      className="w-full p-1.5 text-xs border border-neutral-300 rounded focus:border-neutral-800"
                    />

                    {formData.images && formData.images.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-neutral-500 font-medium">
                          Or click an uploaded photo to assign to this color:
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {formData.images.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => setNewColor(prev => ({ ...prev, image: imgUrl }))}
                              className={`relative w-10 h-10 rounded border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                                newColor.image === imgUrl
                                  ? 'border-neutral-900 ring-2 ring-neutral-900/30'
                                  : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                              }`}
                              title={`Assign photo ${imgIdx + 1} to this color`}
                            >
                              <img src={imgUrl} alt={`Photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the silhouette, embroidery details, and styling advice..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              {/* Flags — now handled by Section Tags above, keep for legacy/compat */}
              <div className="hidden">
                <input type="hidden" value={String(formData.is_new_arrival)} />
                <input type="hidden" value={String(formData.is_featured)} />
                <input type="hidden" value={String(formData.is_bestseller)} />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-maroon text-white font-bold rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
