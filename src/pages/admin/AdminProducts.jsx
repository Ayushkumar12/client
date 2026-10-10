import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  Star,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ImageUploader } from '../../components/common/ImageUploader.jsx';

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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    category_slug: 'suits',
    sub_category: 'Anarkali Suits',
    fabric: 'Georgette',
    occasion: 'Wedding',
    sku: '',
    stock: 50,
    is_featured: false,
    is_new_arrival: true,
    is_bestseller: false,
    sections: [],
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Royal Blue', hex: '#1E3A8A' }]
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

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      short_description: '',
      price: '',
      original_price: '',
      category_slug: 'stitched-suits',
      sub_category: 'Anarkali Suits',
      fabric: 'Georgette',
      occasion: 'Wedding',
      sku: `OCT-${Date.now().toString().slice(-4)}`,
      stock: 50,
      is_featured: false,
      is_new_arrival: true,
      is_bestseller: false,
      sections: [],
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Royal Blue', hex: '#1E3A8A' }]
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
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
      images: p.images || [],
      sizes: p.sizes || ['S', 'M', 'L'],
      colors: p.colors || []
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
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
          </div>
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
                  <th className="p-4">Admin Ratings</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
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
                        <div className="flex items-center space-x-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating || 4.8}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">({p.reviews_count || 12})</span>
                        </div>
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
              <h3 className="font-serif font-bold text-lg text-neutral-900">
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
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="w-full p-2.5 border rounded-lg capitalize"
                  >
                    {ALL_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Sections / Cross-listing Tags */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-2">Display Sections <span className="font-normal text-neutral-400 text-[11px]">(select all that apply)</span></label>
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
                    Sections control which homepage shelves, filters, and promotional banners this product appears on.
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
