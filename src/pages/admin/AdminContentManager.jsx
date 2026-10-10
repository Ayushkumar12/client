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
  ToggleRight,
  FileText,
  HelpCircle,
  Scissors,
  Truck,
  Mail,
  MessageCircle,
  MapPin,
  Search
} from 'lucide-react';
import { useContent, DEFAULT_SITE_CONTENT } from '../../context/ContentContext.jsx';
import { ImageUploader } from '../../components/common/ImageUploader.jsx';

export function AdminContentManager() {
  const { content, updateContent, resetSection, refreshContent } = useContent();

  const [activeTab, setActiveTab] = useState('page_availability');
  const [activePolicySubtab, setActivePolicySubtab] = useState('contact');
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

  // Policy & Info Pages helpers
  const updatePageData = (pageKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pages: {
        ...(prev.pages || DEFAULT_SITE_CONTENT.pages),
        [pageKey]: {
          ...(prev.pages?.[pageKey] || DEFAULT_SITE_CONTENT.pages[pageKey] || {}),
          [field]: value
        }
      }
    }));
  };

  // Shipping section helpers
  const handleAddShippingSection = () => {
    const currentSections = formData.pages?.shipping?.sections || DEFAULT_SITE_CONTENT.pages.shipping.sections;
    const updated = [...currentSections, { title: 'New Policy Section', content: '' }];
    updatePageData('shipping', 'sections', updated);
  };

  const handleUpdateShippingSection = (idx, field, value) => {
    const currentSections = [...(formData.pages?.shipping?.sections || DEFAULT_SITE_CONTENT.pages.shipping.sections)];
    currentSections[idx] = { ...currentSections[idx], [field]: value };
    updatePageData('shipping', 'sections', currentSections);
  };

  const handleDeleteShippingSection = (idx) => {
    const currentSections = [...(formData.pages?.shipping?.sections || DEFAULT_SITE_CONTENT.pages.shipping.sections)];
    const updated = currentSections.filter((_, i) => i !== idx);
    updatePageData('shipping', 'sections', updated);
  };

  // Returns steps helpers
  const handleUpdateReturnStep = (idx, field, value) => {
    const currentSteps = [...(formData.pages?.returns?.steps || DEFAULT_SITE_CONTENT.pages.returns.steps)];
    currentSteps[idx] = { ...currentSteps[idx], [field]: value };
    updatePageData('returns', 'steps', currentSteps);
  };

  // Size chart suits helpers
  const handleUpdateSuitRow = (idx, field, value) => {
    const currentRows = [...(formData.pages?.size_guide?.suits_chart || DEFAULT_SITE_CONTENT.pages.size_guide.suits_chart)];
    currentRows[idx] = { ...currentRows[idx], [field]: value };
    updatePageData('size_guide', 'suits_chart', currentRows);
  };

  const handleAddSuitRow = () => {
    const currentRows = [...(formData.pages?.size_guide?.suits_chart || DEFAULT_SITE_CONTENT.pages.size_guide.suits_chart)];
    currentRows.push({ size: '4XL', bust: '48', waist: '42', hip: '52', length: '46', shoulder: '17.5' });
    updatePageData('size_guide', 'suits_chart', currentRows);
  };

  const handleDeleteSuitRow = (idx) => {
    const currentRows = [...(formData.pages?.size_guide?.suits_chart || DEFAULT_SITE_CONTENT.pages.size_guide.suits_chart)];
    const updated = currentRows.filter((_, i) => i !== idx);
    updatePageData('size_guide', 'suits_chart', updated);
  };

  // Size chart juttis helpers
  const handleUpdateJuttiRow = (idx, field, value) => {
    const currentRows = [...(formData.pages?.size_guide?.juttis_chart || DEFAULT_SITE_CONTENT.pages.size_guide.juttis_chart)];
    currentRows[idx] = { ...currentRows[idx], [field]: value };
    updatePageData('size_guide', 'juttis_chart', currentRows);
  };

  const handleAddJuttiRow = () => {
    const currentRows = [...(formData.pages?.size_guide?.juttis_chart || DEFAULT_SITE_CONTENT.pages.size_guide.juttis_chart)];
    currentRows.push({ ind_uk: '9', eu: '42', us: '11', foot_length: '27.0 cm' });
    updatePageData('size_guide', 'juttis_chart', currentRows);
  };

  const handleDeleteJuttiRow = (idx) => {
    const currentRows = [...(formData.pages?.size_guide?.juttis_chart || DEFAULT_SITE_CONTENT.pages.size_guide.juttis_chart)];
    const updated = currentRows.filter((_, i) => i !== idx);
    updatePageData('size_guide', 'juttis_chart', updated);
  };

  // FAQ Category & Item helpers
  const handleAddFaqCategory = () => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    currentCategories.push({
      name: 'New Category',
      items: [{ question: 'Sample Question?', answer: 'Detailed helpful answer.' }]
    });
    updatePageData('faq', 'categories', currentCategories);
  };

  const handleUpdateFaqCategoryName = (catIdx, name) => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    currentCategories[catIdx] = { ...currentCategories[catIdx], name };
    updatePageData('faq', 'categories', currentCategories);
  };

  const handleDeleteFaqCategory = (catIdx) => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    const updated = currentCategories.filter((_, i) => i !== catIdx);
    updatePageData('faq', 'categories', updated);
  };

  const handleAddFaqItem = (catIdx) => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    const items = [...(currentCategories[catIdx]?.items || [])];
    items.push({ question: 'New Question?', answer: 'Helpful resolution details here.' });
    currentCategories[catIdx] = { ...currentCategories[catIdx], items };
    updatePageData('faq', 'categories', currentCategories);
  };

  const handleUpdateFaqItem = (catIdx, itemIdx, field, value) => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    const items = [...(currentCategories[catIdx]?.items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    currentCategories[catIdx] = { ...currentCategories[catIdx], items };
    updatePageData('faq', 'categories', currentCategories);
  };

  const handleDeleteFaqItem = (catIdx, itemIdx) => {
    const currentCategories = [...(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories)];
    const items = (currentCategories[catIdx]?.items || []).filter((_, i) => i !== itemIdx);
    currentCategories[catIdx] = { ...currentCategories[catIdx], items };
    updatePageData('faq', 'categories', currentCategories);
  };

  // Policy Section helpers for Terms & Privacy
  const handleAddLegalSection = (pageKey) => {
    const currentSections = [...(formData.pages?.[pageKey]?.sections || DEFAULT_SITE_CONTENT.pages[pageKey].sections)];
    currentSections.push({ title: 'New Section Title', content: 'Section terms and details.' });
    updatePageData(pageKey, 'sections', currentSections);
  };

  const handleUpdateLegalSection = (pageKey, idx, field, value) => {
    const currentSections = [...(formData.pages?.[pageKey]?.sections || DEFAULT_SITE_CONTENT.pages[pageKey].sections)];
    currentSections[idx] = { ...currentSections[idx], [field]: value };
    updatePageData(pageKey, 'sections', currentSections);
  };

  const handleDeleteLegalSection = (pageKey, idx) => {
    const currentSections = [...(formData.pages?.[pageKey]?.sections || DEFAULT_SITE_CONTENT.pages[pageKey].sections)];
    const updated = currentSections.filter((_, i) => i !== idx);
    updatePageData(pageKey, 'sections', updated);
  };

  const tabs = [
    { id: 'page_availability', label: 'Page Availability' },
    { id: 'policy_pages', label: 'Policy & Customer Care Pages' },
    { id: 'hero_slides', label: 'Hero Slideshow Banners' },
    { id: 'jharokha', label: 'Category Arches' },
    { id: 'homepage_sections', label: 'Sections & Fixed Texts' },
    { id: 'brand_footer', label: 'Brand Info & Footer' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg border border-neutral-200">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">
            Site Content &amp; CMS Manager
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage site banners, customer care policy content, brand details, and category page launch status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleReset(activeTab === 'page_availability' ? 'page_availability' : activeTab === 'hero_slides' ? 'hero_slides' : 'all')}
            disabled={saving}
            className="px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-3 rounded-md flex items-center justify-between transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Standard Horizontal Navigation Tabs */}
      <div className="flex space-x-1 overflow-x-auto border-b border-neutral-200 bg-white p-1 rounded-lg border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAGE AVAILABILITY & COMING SOON MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'page_availability' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-3">
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
                  className={`bg-white rounded-sm border p-5 space-y-4 shadow-xs transition-all ${
                    isActive
                      ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 to-white'
                      : isComingSoon
                      ? 'border-amber-300 bg-gradient-to-b from-amber-50/30 to-white ring-1 ring-amber-300/50'
                      : 'border-neutral-200 bg-neutral-50/40'
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
                            ? 'bg-neutral-800 text-white shadow-xs'
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
          <div className="flex items-center justify-between bg-white p-5 rounded-sm border border-neutral-200 shadow-xs">
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
                className="bg-white rounded-sm border border-neutral-200 p-5 shadow-xs space-y-4"
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
          <div className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              Jharokha Silhouette Arches
            </h2>
            <p className="text-xs text-neutral-500">
              Manage the circular/arched categories presented directly below the hero banner.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(formData.jharokha_categories || []).map((cat, idx) => (
              <div key={cat.id || idx} className="bg-white rounded-sm border border-neutral-200 p-4 space-y-3 shadow-xs flex flex-col justify-between">
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
          <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-6 shadow-xs">
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
                  <div key={idx} className="bg-[#FAF7F2] p-4 rounded-sm border border-amber-200/80 space-y-3 text-xs flex flex-col justify-between">
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
          <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-6 shadow-xs">
            <div className="border-b border-neutral-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                2. Bento Mosaic & ZEWAR by OCT9
              </h3>
              <p className="text-xs text-neutral-500">
                Manage the tall Zewar card and the 6 symmetrical category cards.
              </p>
            </div>

            {/* Zewar Card */}
            <div className="bg-[#FAF7F2] p-5 rounded-sm border border-amber-200/80 space-y-4">
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
                  <div key={idx} className="bg-white p-4 rounded-sm border border-neutral-200 space-y-3 text-xs flex flex-col justify-between shadow-2xs">
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
          <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-6 shadow-xs">
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
          <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-4 shadow-xs">
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
                  placeholder="Free Shipping on orders above ₹1,999 • Handcrafted Ethnic Wear"
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
          <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-4 shadow-xs">
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

      {/* ========================================================================= */}
      {/* TAB 6: POLICY & CUSTOMER CARE PAGES MANAGER (GENERIC UI) */}
      {/* ========================================================================= */}
      {activeTab === 'policy_pages' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">
                  Customer Care, Sizing & Policy Pages Content
                </h2>
                <p className="text-xs text-neutral-500">
                  Edit texts, contact details, shipping timelines, 7-day return procedures, size charts, and FAQs across the store.
                </p>
              </div>
            </div>

            {/* Subtabs Bar */}
            <div className="flex space-x-2 overflow-x-auto pt-3 border-t border-neutral-100">
              {[
                { id: 'contact', label: 'Contact Us (/contact)', link: '/contact' },
                { id: 'shipping', label: 'Shipping Policy (/shipping-policy)', link: '/shipping-policy' },
                { id: 'returns', label: 'Returns & Exchanges (/returns)', link: '/returns' },
                { id: 'size_guide', label: 'Size Guide (/size-guide)', link: '/size-guide' },
                { id: 'faq', label: 'FAQs (/faq)', link: '/faq' },
                { id: 'legal', label: 'Terms, Privacy & About', link: '/terms' }
              ].map((subtab) => (
                <button
                  key={subtab.id}
                  type="button"
                  onClick={() => setActivePolicySubtab(subtab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activePolicySubtab === subtab.id
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-neutral-600 hover:bg-neutral-200/80 border border-neutral-200/70'
                  }`}
                >
                  {subtab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUBTAB 1: CONTACT US */}
          {activePolicySubtab === 'contact' && (
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">Contact Us Page (/contact)</h3>
                  <p className="text-xs text-neutral-500">Manage support phone, email, WhatsApp chat number, working hours & studio address.</p>
                </div>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Badge Text:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.badge || ''}
                    onChange={(e) => updatePageData('contact', 'badge', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Page Heading Title:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.title || ''}
                    onChange={(e) => updatePageData('contact', 'title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Subtitle / Introduction:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.subtitle || ''}
                    onChange={(e) => updatePageData('contact', 'subtitle', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Support Phone:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.phone || ''}
                    onChange={(e) => updatePageData('contact', 'phone', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Support Email:</label>
                  <input
                    type="email"
                    value={formData.pages?.contact?.email || ''}
                    onChange={(e) => updatePageData('contact', 'email', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">WhatsApp Number (with Country Code):</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.whatsapp || ''}
                    onChange={(e) => updatePageData('contact', 'whatsapp', e.target.value)}
                    placeholder="919876543210"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Working Hours:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.hours || ''}
                    onChange={(e) => updatePageData('contact', 'hours', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Average Response Time:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.response_time || ''}
                    onChange={(e) => updatePageData('contact', 'response_time', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Flagship Studio Address:</label>
                  <input
                    type="text"
                    value={formData.pages?.contact?.address || ''}
                    onChange={(e) => updatePageData('contact', 'address', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Custom Note / Consultation Note:</label>
                  <textarea
                    rows={2}
                    value={formData.pages?.contact?.custom_message || ''}
                    onChange={(e) => updatePageData('contact', 'custom_message', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: SHIPPING POLICY */}
          {activePolicySubtab === 'shipping' && (
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">Shipping & Delivery Policy Page (/shipping-policy)</h3>
                  <p className="text-xs text-neutral-500">Edit free shipping rules, express dispatch metrics, and policy section descriptions.</p>
                </div>
                <a
                  href="/shipping-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Free Shipping Threshold (₹):</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.free_shipping_threshold || ''}
                    onChange={(e) => updatePageData('shipping', 'free_shipping_threshold', e.target.value)}
                    placeholder="999"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Flat Fee Below Threshold (₹):</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.standard_shipping_fee || ''}
                    onChange={(e) => updatePageData('shipping', 'standard_shipping_fee', e.target.value)}
                    placeholder="99"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Ready-to-Wear Dispatch:</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.dispatch_ready || ''}
                    onChange={(e) => updatePageData('shipping', 'dispatch_ready', e.target.value)}
                    placeholder="24–48 Hours"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Metro Air Delivery Time:</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.delivery_metro || ''}
                    onChange={(e) => updatePageData('shipping', 'delivery_metro', e.target.value)}
                    placeholder="2–4 Business Days"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Custom Tailored Dispatch:</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.dispatch_tailored || ''}
                    onChange={(e) => updatePageData('shipping', 'dispatch_tailored', e.target.value)}
                    placeholder="5–7 Business Days"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rest of India Delivery Time:</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.delivery_rest || ''}
                    onChange={(e) => updatePageData('shipping', 'delivery_rest', e.target.value)}
                    placeholder="4–7 Business Days"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Logistics & Courier Partners:</label>
                  <input
                    type="text"
                    value={formData.pages?.shipping?.courier_partners || ''}
                    onChange={(e) => updatePageData('shipping', 'courier_partners', e.target.value)}
                    placeholder="Bluedart, Delhivery, DTDC, Xpressbees via Shiprocket"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              {/* Policy Sections Manager */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                    Policy Paragraph Sections
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddShippingSection}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.pages?.shipping?.sections || DEFAULT_SITE_CONTENT.pages.shipping.sections).map((sec, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleUpdateShippingSection(idx, 'title', e.target.value)}
                          placeholder="Section Title"
                          className="font-bold text-neutral-900 bg-white p-2 rounded-lg border border-neutral-300 flex-1 mr-3"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteShippingSection(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.content || ''}
                        onChange={(e) => handleUpdateShippingSection(idx, 'content', e.target.value)}
                        placeholder="Detailed terms and clauses for this shipping topic..."
                        className="w-full p-2.5 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: RETURNS & EXCHANGES */}
          {activePolicySubtab === 'returns' && (
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">Returns & Exchanges Policy (/returns)</h3>
                  <p className="text-xs text-neutral-500">Edit return window, 4-step reverse pickup workflow, eligible items criteria, and refund timelines.</p>
                </div>
                <a
                  href="/returns"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Return Window Period:</label>
                  <input
                    type="text"
                    value={formData.pages?.returns?.return_window || ''}
                    onChange={(e) => updatePageData('returns', 'return_window', e.target.value)}
                    placeholder="7 Days from Delivery"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Size Exchange Window Period:</label>
                  <input
                    type="text"
                    value={formData.pages?.returns?.exchange_window || ''}
                    onChange={(e) => updatePageData('returns', 'exchange_window', e.target.value)}
                    placeholder="7 Days from Delivery"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Prepaid Refund Timeline:</label>
                  <input
                    type="text"
                    value={formData.pages?.returns?.refund_timeline_prepaid || ''}
                    onChange={(e) => updatePageData('returns', 'refund_timeline_prepaid', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">COD Refund Timeline:</label>
                  <input
                    type="text"
                    value={formData.pages?.returns?.refund_timeline_cod || ''}
                    onChange={(e) => updatePageData('returns', 'refund_timeline_cod', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Eligible Items Description:</label>
                  <textarea
                    rows={2}
                    value={formData.pages?.returns?.eligible_items || ''}
                    onChange={(e) => updatePageData('returns', 'eligible_items', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Non-Eligible Items Description:</label>
                  <textarea
                    rows={2}
                    value={formData.pages?.returns?.non_eligible_items || ''}
                    onChange={(e) => updatePageData('returns', 'non_eligible_items', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Cancellation Policy Note:</label>
                  <input
                    type="text"
                    value={formData.pages?.returns?.cancellation_policy || ''}
                    onChange={(e) => updatePageData('returns', 'cancellation_policy', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              {/* 4 Steps Editor */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                  The 4-Step Reverse Logistics Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.pages?.returns?.steps || DEFAULT_SITE_CONTENT.pages.returns.steps).map((step, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-brand-maroon text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.title || ''}
                          onChange={(e) => handleUpdateReturnStep(idx, 'title', e.target.value)}
                          className="font-bold text-neutral-900 bg-white p-1.5 rounded-lg border border-neutral-300 flex-1"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={step.desc || ''}
                        onChange={(e) => handleUpdateReturnStep(idx, 'desc', e.target.value)}
                        className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: SIZE GUIDE & TAILORING */}
          {activePolicySubtab === 'size_guide' && (
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">Size Guide & Tailoring Specifications (/size-guide)</h3>
                  <p className="text-xs text-neutral-500">Edit suits & jutti measurement tables, custom tailoring advisory, and fit notes.</p>
                </div>
                <a
                  href="/size-guide"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Suits Measurement Table Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                    1. Stitched Suits & Kurtas Sizing Table (Inches)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSuitRow}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 font-bold text-neutral-700">
                      <tr>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5">Bust (")</th>
                        <th className="p-2.5">Waist (")</th>
                        <th className="p-2.5">Hip (")</th>
                        <th className="p-2.5">Length (")</th>
                        <th className="p-2.5">Shoulder (")</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {(formData.pages?.size_guide?.suits_chart || DEFAULT_SITE_CONTENT.pages.size_guide.suits_chart).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => handleUpdateSuitRow(idx, 'size', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 font-bold text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.bust}
                              onChange={(e) => handleUpdateSuitRow(idx, 'bust', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.waist}
                              onChange={(e) => handleUpdateSuitRow(idx, 'waist', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.hip}
                              onChange={(e) => handleUpdateSuitRow(idx, 'hip', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.length}
                              onChange={(e) => handleUpdateSuitRow(idx, 'length', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.shoulder}
                              onChange={(e) => handleUpdateSuitRow(idx, 'shoulder', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSuitRow(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Juttis Footwear Table Editor */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                    2. Punjabi Juttis & Mojari Table
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddJuttiRow}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Jutti Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 font-bold text-neutral-700">
                      <tr>
                        <th className="p-2.5">India / UK</th>
                        <th className="p-2.5">EU</th>
                        <th className="p-2.5">US</th>
                        <th className="p-2.5">Foot Length (cm)</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {(formData.pages?.size_guide?.juttis_chart || DEFAULT_SITE_CONTENT.pages.size_guide.juttis_chart).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.ind_uk}
                              onChange={(e) => handleUpdateJuttiRow(idx, 'ind_uk', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 font-bold text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.eu}
                              onChange={(e) => handleUpdateJuttiRow(idx, 'eu', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.us}
                              onChange={(e) => handleUpdateJuttiRow(idx, 'us', e.target.value)}
                              className="w-16 p-1 rounded border border-neutral-300 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.foot_length}
                              onChange={(e) => handleUpdateJuttiRow(idx, 'foot_length', e.target.value)}
                              className="w-24 p-1 rounded border border-neutral-300 text-center font-mono"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteJuttiRow(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 text-xs">
                <label className="font-bold text-neutral-700 block mb-1">Tailoring & Alterations Note:</label>
                <textarea
                  rows={2}
                  value={formData.pages?.size_guide?.tailoring_info || ''}
                  onChange={(e) => updatePageData('size_guide', 'tailoring_info', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>
            </div>
          )}

          {/* SUBTAB 5: FAQS & HELP */}
          {activePolicySubtab === 'faq' && (
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">Frequently Asked Questions (/faq)</h3>
                  <p className="text-xs text-neutral-500">Manage FAQ categories, questions, and answers with live instant search on the storefront.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddFaqCategory}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-maroon text-white rounded-lg text-xs font-bold hover:bg-brand-maroon-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                  <a
                    href="/faq"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Categories & Questions List */}
              <div className="space-y-6">
                {(formData.pages?.faq?.categories || DEFAULT_SITE_CONTENT.pages.faq.categories).map((cat, catIdx) => (
                  <div key={catIdx} className="bg-[#FAF7F2] p-5 rounded-sm border border-neutral-200/90 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
                      <div className="flex items-center space-x-2 flex-1 mr-4">
                        <span className="text-xs font-bold text-neutral-400">Category:</span>
                        <input
                          type="text"
                          value={cat.name || ''}
                          onChange={(e) => handleUpdateFaqCategoryName(catIdx, e.target.value)}
                          className="font-serif font-bold text-sm text-neutral-900 bg-white px-3 py-1.5 rounded-lg border border-neutral-300 flex-1 max-w-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAddFaqItem(catIdx)}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Question</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaqCategory(catIdx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(cat.items || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-400 text-[10px] uppercase">Q#{itemIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaqItem(catIdx, itemIdx)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={item.question || ''}
                              onChange={(e) => handleUpdateFaqItem(catIdx, itemIdx, 'question', e.target.value)}
                              placeholder="Question text..."
                              className="w-full p-2 rounded-lg border border-neutral-300 font-semibold text-neutral-900"
                            />
                          </div>
                          <div>
                            <textarea
                              rows={2}
                              value={item.answer || ''}
                              onChange={(e) => handleUpdateFaqItem(catIdx, itemIdx, 'answer', e.target.value)}
                              placeholder="Detailed response/answer..."
                              className="w-full p-2 rounded-lg border border-neutral-300 text-neutral-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 6: TERMS, PRIVACY & ABOUT */}
          {activePolicySubtab === 'legal' && (
            <div className="space-y-6">
              {/* About Us Atelier Story */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900">About OCT9 Atelier Story (/about)</h3>
                    <p className="text-xs text-neutral-500">Edit the heritage story and brand philosophy.</p>
                  </div>
                  <a
                    href="/about"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Heading Title:</label>
                    <input
                      type="text"
                      value={formData.pages?.about?.title || ''}
                      onChange={(e) => updatePageData('about', 'title', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Subtitle:</label>
                    <input
                      type="text"
                      value={formData.pages?.about?.subtitle || ''}
                      onChange={(e) => updatePageData('about', 'subtitle', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Full Atelier Story:</label>
                    <textarea
                      rows={4}
                      value={formData.pages?.about?.story || ''}
                      onChange={(e) => updatePageData('about', 'story', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300"
                    />
                  </div>
                </div>
              </div>

              {/* Terms of Service Sections */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900">Terms & Conditions (/terms)</h3>
                    <p className="text-xs text-neutral-500">Edit legal clauses and platform terms.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAddLegalSection('terms')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Clause</span>
                    </button>
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                    >
                      <span>View Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  {(formData.pages?.terms?.sections || DEFAULT_SITE_CONTENT.pages.terms.sections).map((sec, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleUpdateLegalSection('terms', idx, 'title', e.target.value)}
                          placeholder="Clause Title"
                          className="font-bold text-neutral-900 bg-white p-2 rounded-lg border border-neutral-300 flex-1 mr-3"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLegalSection('terms', idx)}
                          className="text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={sec.content || ''}
                        onChange={(e) => handleUpdateLegalSection('terms', idx, 'content', e.target.value)}
                        className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Policy Sections */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900">Privacy Policy (/privacy)</h3>
                    <p className="text-xs text-neutral-500">Edit privacy guarantees, cookies and data rights clauses.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAddLegalSection('privacy')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Clause</span>
                    </button>
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                    >
                      <span>View Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  {(formData.pages?.privacy?.sections || DEFAULT_SITE_CONTENT.pages.privacy.sections).map((sec, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleUpdateLegalSection('privacy', idx, 'title', e.target.value)}
                          placeholder="Clause Title"
                          className="font-bold text-neutral-900 bg-white p-2 rounded-lg border border-neutral-300 flex-1 mr-3"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLegalSection('privacy', idx)}
                          className="text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={sec.content || ''}
                        onChange={(e) => handleUpdateLegalSection('privacy', idx, 'content', e.target.value)}
                        className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
