import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Type,
  Phone,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useContent, DEFAULT_SITE_CONTENT } from '../../context/ContentContext.jsx';
import { ImageUploader } from '../../components/common/ImageUploader.jsx';

export function AdminContentManager() {
  const { content, updateContent, resetSection, refreshContent } = useContent();

  const [activeTab, setActiveTab] = useState('page_availability');
  const [formData, setFormData] = useState(content || DEFAULT_SITE_CONTENT);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Keep local state in sync when content loads
  useEffect(() => {
    if (content) {
      setFormData(JSON.parse(JSON.stringify(content)));
    }
  }, [content]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateContent(formData);
      if (res.success) {
        showToast('Website content & page availability updated successfully!', 'success');
        refreshContent();
      } else {
        showToast(res.message || 'Failed to save changes', 'error');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset Section
  const handleReset = async (sectionKey) => {
    if (!window.confirm(`Are you sure you want to reset "${sectionKey}" to system defaults?`)) return;
    setSaving(true);
    try {
      const res = await resetSection(sectionKey);
      if (res.success) {
        showToast(`Section "${sectionKey}" reset to defaults!`, 'success');
        refreshContent();
      } else {
        showToast(res.message || 'Failed to reset section', 'error');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper updater for deep fields
  const updateBrandField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      brand: { ...prev.brand, [field]: value }
    }));
  };

  const updateSectionField = (sec, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sec]: {
          ...(prev.sections?.[sec] || {}),
          [field]: value
        }
      }
    }));
  };

  const updatePageStatus = (slug, status) => {
    setFormData((prev) => ({
      ...prev,
      page_availability: {
        ...prev.page_availability,
        [slug]: {
          ...(prev.page_availability?.[slug] || {}),
          status
        }
      }
    }));
  };

  const updatePageField = (slug, field, value) => {
    setFormData((prev) => ({
      ...prev,
      page_availability: {
        ...prev.page_availability,
        [slug]: {
          ...(prev.page_availability?.[slug] || {}),
          [field]: value
        }
      }
    }));
  };

  // Slideshow helpers
  const handleSlideChange = (idx, field, value) => {
    const updated = [...(formData.hero_slides || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, hero_slides: updated }));
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      alt: 'Luxury Indian Ethnic Wear',
      title: 'New Royal Collection',
      subtitle: 'Handcrafted Heritage Drapes',
      link: '/category/all',
      active: true,
      order: (formData.hero_slides?.length || 0) + 1
    };
    setFormData((prev) => ({
      ...prev,
      hero_slides: [...(prev.hero_slides || []), newSlide]
    }));
  };

  const handleDeleteSlide = (idx) => {
    const updated = formData.hero_slides.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, hero_slides: updated }));
  };

  // Jharokha category helpers
  const handleJharokhaChange = (idx, field, value) => {
    const updated = [...(formData.jharokha_categories || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, jharokha_categories: updated }));
  };

  // Bento category helpers
  const handleBentoCategoryChange = (idx, field, value) => {
    const updated = [...(formData.sections?.bento_mosaic?.categories || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        bento_mosaic: {
          ...prev.sections?.bento_mosaic,
          categories: updated
        }
      }
    }));
  };

  // Inside Atelier Arch helpers
  const handleInsideArchChange = (idx, field, value) => {
    const updated = [...(formData.sections?.inside_brand?.arches || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        inside_brand: {
          ...prev.sections?.inside_brand,
          arches: updated
        }
      }
    }));
  };

  // Brand Pillars helper
  const handlePillarChange = (idx, field, value) => {
    const updated = [...(formData.pillars || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, pillars: updated }));
  };

  const tabs = [
    { id: 'page_availability', label: '🚀 Page Availability & Coming Soon', icon: Clock },
    { id: 'hero_slides', label: '🖼️ Hero Slideshow Banners', icon: ImageIcon },
    { id: 'jharokha', label: '🏛️ Jharokha Category Arches', icon: Layers },
    { id: 'homepage_sections', label: '✍️ Sections & Fixed Texts', icon: Type },
    { id: 'brand_footer', label: '🛡️ Brand Info & Footer', icon: Phone }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-brand-maroon/10 text-brand-maroon p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-brand-maroon" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-neutral-900">
              Store Content & CMS Manager
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage all fixed texts, hero images, category arches, brand story, and toggle pages between <strong>Active</strong>, <strong>Coming Soon</strong>, or <strong>Maintenance</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleReset(activeTab === 'page_availability' ? 'page_availability' : activeTab === 'hero_slides' ? 'hero_slides' : 'all')}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Reset Section</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-md transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold opacity-60 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Horizontal Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAGE AVAILABILITY & COMING SOON MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'page_availability' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">
                  Page Availability & Coming Soon Controller
                </h2>
                <p className="text-xs text-neutral-500">
                  Toggle whether category pages are live and ready to shop or displaying a luxury <strong>Coming Soon / Launching Soon</strong> preview with countdown & waitlist notify form.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(formData.page_availability || {}).map(([slug, page]) => {
              const isActive = page.status === 'active';
              const isComingSoon = page.status === 'coming_soon';
              const isMaintenance = page.status === 'maintenance';

              return (
                <div
                  key={slug}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all ${
                    isActive
                      ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 to-white'
                      : isComingSoon
                      ? 'border-amber-300 bg-gradient-to-b from-amber-50/30 to-white ring-1 ring-amber-300/50'
                      : 'border-purple-200 bg-gradient-to-b from-purple-50/20 to-white'
                  }`}
                >
                  {/* Top Bar: Title & Live Link */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">
                        /category/{slug}
                      </span>
                      <input
                        type="text"
                        value={page.title || ''}
                        onChange={(e) => updatePageField(slug, 'title', e.target.value)}
                        placeholder="Page Display Title"
                        className="font-serif font-bold text-base text-neutral-900 border-b border-dashed border-neutral-300 focus:border-brand-maroon focus:outline-none w-full mt-0.5 bg-transparent"
                      />
                    </div>
                    <a
                      href={`/category/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                      title="View Page on Storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Storefront Status:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updatePageStatus(slug, 'active')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Active (Live)
                      </button>

                      <button
                        type="button"
                        onClick={() => updatePageStatus(slug, 'coming_soon')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          isComingSoon
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Coming Soon
                      </button>

                      <button
                        type="button"
                        onClick={() => updatePageStatus(slug, 'maintenance')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          isMaintenance
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Maintenance
                      </button>
                    </div>
                  </div>

                  {/* Teaser Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600">
                      Teaser & Waitlist Description:
                    </label>
                    <textarea
                      rows={2}
                      value={page.teaser || ''}
                      onChange={(e) => updatePageField(slug, 'teaser', e.target.value)}
                      placeholder="e.g. Master artisans are weaving pure Banarasi and Mulberry silks for this royal release."
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-maroon bg-white shadow-2xs font-normal"
                    />
                  </div>

                  {/* Launch Date Picker */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 flex items-center justify-between">
                      <span>Launch Target Date (Optional):</span>
                      {page.launch_date && (
                        <button
                          type="button"
                          onClick={() => updatePageField(slug, 'launch_date', '')}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Clear Date
                        </button>
                      )}
                    </label>
                    <input
                      type="date"
                      value={page.launch_date || ''}
                      onChange={(e) => updatePageField(slug, 'launch_date', e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-maroon bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HERO SLIDESHOW BANNERS */}
      {/* ========================================================================= */}
      {activeTab === 'hero_slides' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Hero Slideshow Banner Manager
              </h2>
              <p className="text-xs text-neutral-500">
                Manage full-bleed luxury banner images, typography overlays, sequence, and CTA destinations.
              </p>
            </div>

            <button
              onClick={handleAddSlide}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-maroon text-white rounded-xl text-xs font-bold hover:bg-brand-maroon-hover transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.hero_slides || []).map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4"
              >
                {/* Header Row: Slide #, Order, Active Toggle, Delete Button */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      Slide #{idx + 1}
                    </span>
                    <label className="flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.active !== false}
                        onChange={(e) => handleSlideChange(idx, 'active', e.target.checked)}
                        className="rounded text-brand-maroon focus:ring-brand-maroon"
                      />
                      <span>Active in Slideshow</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-neutral-500 font-medium">Order:</span>
                      <input
                        type="number"
                        value={slide.order || idx + 1}
                        onChange={(e) => handleSlideChange(idx, 'order', Number(e.target.value))}
                        className="w-12 p-1 text-center border border-neutral-300 rounded-lg font-bold text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Content Grid: Left Banner Image Uploader Canvas (5 cols) + Right Inputs (7 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-5">
                    <ImageUploader
                      images={slide.image}
                      onChange={(newUrl) => handleSlideChange(idx, 'image', newUrl)}
                      multiple={false}
                      label="Banner Image"
                      helperText="Click or drop wide banner image to upload."
                      aspectRatio="aspect-[16/7]"
                      rounded="rounded-xl"
                      fallbackImage="/banners/hero_banner_2.png"
                    />
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Slide Title:</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Royal Heritage Drapes"
                        className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-serif font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Subtitle / Tagline:</label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                        placeholder="e.g. Festive & Bridal Atelier 2026"
                        className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-neutral-700 block mb-1">Click Destination / Category Link:</label>
                      <div className="flex gap-2">
                        <select
                          value={['/category/stitched-suits', '/category/unstitched-suits', '/category/sarees', '/category/designer-suits', '/category/festive-wear', '/category/party-wear', '/category/accessories', '/category/jutti', '/new-arrivals'].includes(slide.link) ? slide.link : 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              handleSlideChange(idx, 'link', e.target.value);
                            }
                          }}
                          className="p-2 rounded-xl border border-neutral-300 bg-white font-medium text-xs shrink-0"
                        >
                          <option value="/category/stitched-suits">Stitched Suits</option>
                          <option value="/category/unstitched-suits">Unstitched Suits</option>
                          <option value="/category/sarees">Sarees</option>
                          <option value="/category/designer-suits">Designer Suits</option>
                          <option value="/category/festive-wear">Festive Wear</option>
                          <option value="/category/party-wear">Party Wear</option>
                          <option value="/category/accessories">Accessories</option>
                          <option value="/category/jutti">Jutti</option>
                          <option value="/new-arrivals">New Arrivals</option>
                          <option value="custom">Custom Link →</option>
                        </select>
                        <input
                          type="text"
                          value={slide.link || ''}
                          onChange={(e) => handleSlideChange(idx, 'link', e.target.value)}
                          placeholder="/category/stitched-suits"
                          className="flex-1 p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: JHAROKHA CATEGORY ARCHES */}
      {/* ========================================================================= */}
      {activeTab === 'jharokha' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              Jharokha Silhouette Arches
            </h2>
            <p className="text-xs text-neutral-500">
              Manage the circular/arched categories presented directly below the hero banner.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(formData.jharokha_categories || []).map((cat, idx) => (
              <div key={cat.id || idx} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Circular Interactive Arch Uploader */}
                  <div className="w-24 h-24 mx-auto">
                    <ImageUploader
                      images={cat.image}
                      onChange={(newUrl) => handleJharokhaChange(idx, 'image', newUrl)}
                      multiple={false}
                      aspectRatio="aspect-square"
                      rounded="rounded-full"
                      fallbackImage="/banners/hero_banner_1.png"
                      showLibraryButton={false}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-0.5">Category Name:</label>
                      <input
                        type="text"
                        value={cat.name || ''}
                        onChange={(e) => handleJharokhaChange(idx, 'name', e.target.value)}
                        className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-0.5">Tagline / Subtitle:</label>
                      <input
                        type="text"
                        value={cat.tagline || ''}
                        onChange={(e) => handleJharokhaChange(idx, 'tagline', e.target.value)}
                        placeholder="e.g. Pure Heritage Weaves"
                        className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-0.5">Link Target:</label>
                      <input
                        type="text"
                        value={cat.link || ''}
                        onChange={(e) => handleJharokhaChange(idx, 'link', e.target.value)}
                        className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-xs font-semibold pt-2 border-t border-neutral-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.active !== false}
                    onChange={(e) => handleJharokhaChange(idx, 'active', e.target.checked)}
                    className="rounded text-brand-maroon focus:ring-brand-maroon"
                  />
                  <span>Show on Homepage</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HOMEPAGE SECTIONS & FIXED TEXTS */}
      {/* ========================================================================= */}
      {activeTab === 'homepage_sections' && (
        <div className="space-y-8">
          {/* Section 1: Inside OCT9 (The Atelier & 3 Arches) */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-xs">
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  1. Inside OCT9 (The Royal Atelier Section)
                </h3>
                <p className="text-xs text-neutral-500">
                  Edit the atelier brand story heading, philosophy text, and the 3 architectural Mughal arches.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Badge Text:</label>
                <input
                  type="text"
                  value={formData.sections?.inside_brand?.badge || ''}
                  onChange={(e) => updateSectionField('inside_brand', 'badge', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-brand-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Section Title:</label>
                <input
                  type="text"
                  value={formData.sections?.inside_brand?.title || ''}
                  onChange={(e) => updateSectionField('inside_brand', 'title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-brand-maroon focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Italic Tagline:</label>
                <input
                  type="text"
                  value={formData.sections?.inside_brand?.italic_tagline || ''}
                  onChange={(e) => updateSectionField('inside_brand', 'italic_tagline', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-brand-maroon focus:outline-none italic"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">CTA Button Text:</label>
                <input
                  type="text"
                  value={formData.sections?.inside_brand?.cta_text || ''}
                  onChange={(e) => updateSectionField('inside_brand', 'cta_text', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-brand-maroon focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">Main Atelier Description:</label>
                <textarea
                  rows={3}
                  value={formData.sections?.inside_brand?.description || ''}
                  onChange={(e) => updateSectionField('inside_brand', 'description', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-brand-maroon focus:outline-none"
                />
              </div>
            </div>

            {/* 3 Architectural Arches */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                The 3 Architectural Arches (Inside OCT9)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(formData.sections?.inside_brand?.arches || []).map((arch, idx) => (
                  <div key={idx} className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-200/80 space-y-3 text-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Arch-shaped Interactive Image Uploader */}
                      <ImageUploader
                        images={arch.image}
                        onChange={(newUrl) => handleInsideArchChange(idx, 'image', newUrl)}
                        multiple={false}
                        aspectRatio="aspect-[3/4]"
                        rounded="rounded-t-[40px] rounded-b-xl"
                        fallbackImage="/banners/hero_banner_1.png"
                        helperText="Click or drop an image to upload."
                      />

                      <div className="space-y-2">
                        <div>
                          <label className="font-bold text-neutral-700 block mb-0.5">Arch Title:</label>
                          <input
                            type="text"
                            value={arch.title || ''}
                            onChange={(e) => handleInsideArchChange(idx, 'title', e.target.value)}
                            className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-semibold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-0.5">Subtitle:</label>
                          <input
                            type="text"
                            value={arch.subtitle || ''}
                            onChange={(e) => handleInsideArchChange(idx, 'subtitle', e.target.value)}
                            className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-0.5">Badge:</label>
                          <input
                            type="text"
                            value={arch.badge || ''}
                            onChange={(e) => handleInsideArchChange(idx, 'badge', e.target.value)}
                            className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-0.5">Link Destination:</label>
                          <input
                            type="text"
                            value={arch.link || ''}
                            onChange={(e) => handleInsideArchChange(idx, 'link', e.target.value)}
                            className="w-full p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-maroon font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Bento Mosaic & ZEWAR */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-xs">
            <div className="border-b border-neutral-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                2. Bento Mosaic & ZEWAR by OCT9
              </h3>
              <p className="text-xs text-neutral-500">
                Manage the tall Zewar card and the 6 symmetrical category cards.
              </p>
            </div>

            {/* Zewar Card */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-amber-200/80 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                Tall Hero Card: ZEWAR by OCT9
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Tag Badge:</label>
                  <input
                    type="text"
                    value={formData.sections?.bento_mosaic?.zewar_card?.tag || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          bento_mosaic: {
                            ...prev.sections?.bento_mosaic,
                            zewar_card: {
                              ...prev.sections?.bento_mosaic?.zewar_card,
                              tag: e.target.value
                            }
                          }
                        }
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Title:</label>
                  <input
                    type="text"
                    value={formData.sections?.bento_mosaic?.zewar_card?.title || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          bento_mosaic: {
                            ...prev.sections?.bento_mosaic,
                            zewar_card: {
                              ...prev.sections?.bento_mosaic?.zewar_card,
                              title: e.target.value
                            }
                          }
                        }
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    images={formData.sections?.bento_mosaic?.zewar_card?.image || ''}
                    onChange={(newUrl) =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          bento_mosaic: {
                            ...prev.sections?.bento_mosaic,
                            zewar_card: {
                              ...prev.sections?.bento_mosaic?.zewar_card,
                              image: newUrl
                            }
                          }
                        }
                      }))
                    }
                    multiple={false}
                    label="Zewar Feature Photo (Direct File Upload)"
                    helperText="Click or drop an image to upload."
                    aspectRatio="aspect-[4/3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Description:</label>
                  <input
                    type="text"
                    value={formData.sections?.bento_mosaic?.zewar_card?.description || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          bento_mosaic: {
                            ...prev.sections?.bento_mosaic,
                            zewar_card: {
                              ...prev.sections?.bento_mosaic?.zewar_card,
                              description: e.target.value
                            }
                          }
                        }
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">CTA Button Text:</label>
                  <input
                    type="text"
                    value={formData.sections?.bento_mosaic?.zewar_card?.cta_text || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          bento_mosaic: {
                            ...prev.sections?.bento_mosaic,
                            zewar_card: {
                              ...prev.sections?.bento_mosaic?.zewar_card,
                              cta_text: e.target.value
                            }
                          }
                        }
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 6 Bento Grid Cards */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                The 6 Symmetrical Bento Category Cards
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(formData.sections?.bento_mosaic?.categories || []).map((cat, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-3 text-xs flex flex-col justify-between shadow-2xs">
                    <div className="space-y-2.5">
                      <ImageUploader
                        images={cat.image}
                        onChange={(newUrl) => handleBentoCategoryChange(idx, 'image', newUrl)}
                        multiple={false}
                        aspectRatio="aspect-[16/10]"
                        rounded="rounded-xl"
                        fallbackImage="/banners/hero_banner_1.png"
                        helperText="Click or drop an image to upload."
                      />

                      <div>
                        <label className="font-bold text-neutral-700 block mb-0.5">Card Title:</label>
                        <input
                          type="text"
                          value={cat.title || ''}
                          onChange={(e) => handleBentoCategoryChange(idx, 'title', e.target.value)}
                          className="w-full p-2 rounded-xl border border-neutral-300 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-neutral-700 block mb-0.5">Link Destination:</label>
                        <input
                          type="text"
                          value={cat.link || ''}
                          onChange={(e) => handleBentoCategoryChange(idx, 'link', e.target.value)}
                          className="w-full p-2 rounded-xl border border-neutral-300 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Product Row Headings (New Arrivals, Curated Edit, Adorned to Perfection) */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-xs">
            <div className="border-b border-neutral-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                3. Product Feed Section Headings & Badges
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* New Arrivals */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-serif font-bold text-sm text-neutral-900">New Arrivals</h4>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Badge:</label>
                  <input
                    type="text"
                    value={formData.sections?.new_arrivals?.badge || ''}
                    onChange={(e) => updateSectionField('new_arrivals', 'badge', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Heading:</label>
                  <input
                    type="text"
                    value={formData.sections?.new_arrivals?.title || ''}
                    onChange={(e) => updateSectionField('new_arrivals', 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Subtitle:</label>
                  <textarea
                    rows={2}
                    value={formData.sections?.new_arrivals?.subtitle || ''}
                    onChange={(e) => updateSectionField('new_arrivals', 'subtitle', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">CTA Button:</label>
                  <input
                    type="text"
                    value={formData.sections?.new_arrivals?.cta_text || ''}
                    onChange={(e) => updateSectionField('new_arrivals', 'cta_text', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              {/* The OCT9 Edit */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-serif font-bold text-sm text-neutral-900">The OCT9 Edit</h4>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Badge:</label>
                  <input
                    type="text"
                    value={formData.sections?.brand_picks?.badge || ''}
                    onChange={(e) => updateSectionField('brand_picks', 'badge', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Heading:</label>
                  <input
                    type="text"
                    value={formData.sections?.brand_picks?.title || ''}
                    onChange={(e) => updateSectionField('brand_picks', 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Subtitle:</label>
                  <textarea
                    rows={2}
                    value={formData.sections?.brand_picks?.subtitle || ''}
                    onChange={(e) => updateSectionField('brand_picks', 'subtitle', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">CTA Button:</label>
                  <input
                    type="text"
                    value={formData.sections?.brand_picks?.cta_text || ''}
                    onChange={(e) => updateSectionField('brand_picks', 'cta_text', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              {/* Adorned to Perfection */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-serif font-bold text-sm text-neutral-900">Adorned to Perfection</h4>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Badge:</label>
                  <input
                    type="text"
                    value={formData.sections?.adorned_jewels?.badge || ''}
                    onChange={(e) => updateSectionField('adorned_jewels', 'badge', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Heading:</label>
                  <input
                    type="text"
                    value={formData.sections?.adorned_jewels?.title || ''}
                    onChange={(e) => updateSectionField('adorned_jewels', 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">Subtitle:</label>
                  <textarea
                    rows={2}
                    value={formData.sections?.adorned_jewels?.subtitle || ''}
                    onChange={(e) => updateSectionField('adorned_jewels', 'subtitle', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 block mb-1">CTA Button:</label>
                  <input
                    type="text"
                    value={formData.sections?.adorned_jewels?.cta_text || ''}
                    onChange={(e) => updateSectionField('adorned_jewels', 'cta_text', e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BRAND INFO & FOOTER */}
      {/* ========================================================================= */}
      {activeTab === 'brand_footer' && (
        <div className="space-y-6">
          {/* Announcement Bar & General Brand */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-3">
              Announcement Bar & Brand Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">
                  Top Announcement Bar Ticker:
                </label>
                <input
                  type="text"
                  value={formData.brand?.announcement_bar || ''}
                  onChange={(e) => updateBrandField('announcement_bar', e.target.value)}
                  placeholder="✨ Free Shipping Above ₹1,999 • Handcrafted with Love"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Brand Name:</label>
                <input
                  type="text"
                  value={formData.brand?.name || ''}
                  onChange={(e) => updateBrandField('name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Brand Tagline:</label>
                <input
                  type="text"
                  value={formData.brand?.tagline || ''}
                  onChange={(e) => updateBrandField('tagline', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Support Phone:</label>
                <input
                  type="text"
                  value={formData.brand?.support_phone || ''}
                  onChange={(e) => updateBrandField('support_phone', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Support Email:</label>
                <input
                  type="email"
                  value={formData.brand?.support_email || ''}
                  onChange={(e) => updateBrandField('support_email', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">WhatsApp Number (with country code):</label>
                <input
                  type="text"
                  value={formData.brand?.whatsapp_number || ''}
                  onChange={(e) => updateBrandField('whatsapp_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Atelier Address:</label>
                <input
                  type="text"
                  value={formData.brand?.address || ''}
                  onChange={(e) => updateBrandField('address', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Brand Pillars */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-3">
              4 Luxury Brand Pillars (Footer & Boutique)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {(formData.pillars || []).map((pillar, idx) => (
                <div key={idx} className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Pillar #{idx + 1}</span>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Title:</label>
                    <input
                      type="text"
                      value={pillar.title || ''}
                      onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Description:</label>
                    <textarea
                      rows={2}
                      value={pillar.desc || pillar.description || ''}
                      onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
