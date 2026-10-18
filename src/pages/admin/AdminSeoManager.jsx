import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bot,
  MapPin,
  Eye,
  Save,
  ExternalLink,
  Sliders,
  Copy,
  Compass,
  RefreshCw,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useContent, DEFAULT_SEO_CONFIG } from '../../context/ContentContext.jsx';
import { ImageUploader } from '../../components/common/ImageUploader.jsx';
import { GeoMapPicker } from '../../components/admin/GeoMapPicker.jsx';

export function AdminSeoManager({ isEmbedded = false }) {
  const { content, updateContent, refreshContent } = useContent();

  const [activeTab, setActiveTab] = useState('global_seo');
  const [formData, setFormData] = useState(content?.seo || DEFAULT_SEO_CONFIG);
  const [saving, setSaving] = useState(false);
  const [syncingFiles, setSyncingFiles] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [editingPageKey, setEditingPageKey] = useState(null);

  // Sync with context updates
  useEffect(() => {
    if (content?.seo) {
      setFormData(JSON.parse(JSON.stringify(content.seo)));
    }
  }, [content]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateContent({ seo: formData });
      if (res && res.success) {
        if (res.sync) {
          setLastSyncResult(res.sync);
        }
        const updatedCount = res.sync?.updated_files?.length || 0;
        const msg = updatedCount > 0
          ? `SEO, AEO, and GEO settings saved and ${updatedCount} related files updated on disk!`
          : 'SEO, AEO, and GEO settings successfully saved and published!';
        showToast(msg, 'success');
        refreshContent();
      } else {
        showToast(res?.message || 'Failed to update SEO settings', 'error');
      }
    } catch (e) {
      showToast(e.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncFiles = async () => {
    setSyncingFiles(true);
    try {
      const res = await api.syncSeoFiles();
      if (res && res.success) {
        setLastSyncResult(res);
        showToast(res.message || `Successfully synchronized ${res.updated_files?.length || 0} SEO files to disk!`, 'success');
      } else {
        showToast(res?.message || 'Failed to synchronize SEO files', 'error');
      }
    } catch (e) {
      showToast(e.message || 'Error synchronizing files', 'error');
    } finally {
      setSyncingFiles(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all SEO, AEO, and GEO configurations to factory defaults?')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_SEO_CONFIG)));
      showToast('Settings reset to defaults. Click "Save Changes" to apply.', 'info');
    }
  };

  // Updaters
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAeoField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      aeo: { ...(prev.aeo || DEFAULT_SEO_CONFIG.aeo), [field]: value }
    }));
  };

  const updateGeoField = (field, value) => {
    setFormData((prev) => {
      const currentGeo = prev.geo || DEFAULT_SEO_CONFIG.geo;
      const updated = { ...currentGeo, [field]: value };
      if (field === 'latitude') {
        const lat = value ? String(value).trim() : '';
        const lng = currentGeo.longitude ? String(currentGeo.longitude).trim() : '';
        updated.geo_position = lat && lng ? `${lat};${lng}` : '';
        updated.icbm = lat && lng ? `${lat}, ${lng}` : '';
      } else if (field === 'longitude') {
        const lat = currentGeo.latitude ? String(currentGeo.latitude).trim() : '';
        const lng = value ? String(value).trim() : '';
        updated.geo_position = lat && lng ? `${lat};${lng}` : '';
        updated.icbm = lat && lng ? `${lat}, ${lng}` : '';
      }
      return { ...prev, geo: updated };
    });
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => {
      const currentGeo = prev.geo || DEFAULT_SEO_CONFIG.geo;
      const lat = loc.latitude !== undefined ? loc.latitude : currentGeo.latitude;
      const lng = loc.longitude !== undefined ? loc.longitude : currentGeo.longitude;
      const geoPos = loc.geo_position || (lat && lng ? `${lat};${lng}` : '');
      const icbm = loc.icbm || (lat && lng ? `${lat}, ${lng}` : '');

      return {
        ...prev,
        geo: {
          ...currentGeo,
          ...loc,
          latitude: lat,
          longitude: lng,
          geo_position: geoPos,
          icbm: icbm,
          street_address: loc.street_address || currentGeo.street_address,
          full_address: loc.full_address || currentGeo.full_address,
          city: loc.city || currentGeo.city,
          geo_placename: loc.geo_placename || currentGeo.geo_placename,
          state: loc.state || currentGeo.state,
          geo_region: loc.geo_region || currentGeo.geo_region,
          postal_code: loc.postal_code || currentGeo.postal_code,
          country: loc.country || currentGeo.country,
          country_code: loc.country_code || currentGeo.country_code
        }
      };
    });
  };

  const updatePageOverride = (key, field, value) => {
    setFormData((prev) => ({
      ...prev,
      page_overrides: {
        ...(prev.page_overrides || DEFAULT_SEO_CONFIG.page_overrides),
        [key]: {
          ...(prev.page_overrides?.[key] || {}),
          [field]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'global_seo', label: '1. SEO (Search Engine Optimisation)', icon: Globe },
    { id: 'geo', label: '2. GEO (Generative Engine Optimisation)', icon: Bot },
    { id: 'page_overrides', label: '3. Per-Page Overrides', icon: Sliders },
    { id: 'previews', label: '4. Synchronized Files & Previews', icon: FileCheck }
  ];

  // Character counter helper
  const titleLen = (formData.meta_title || '').length;
  const descLen = (formData.meta_description || '').length;

  return (
    <div className={`space-y-6 ${isEmbedded ? 'pt-4' : 'p-6 max-w-7xl mx-auto'}`}>
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-xl font-bold text-neutral-900 tracking-tight">
              SEO & GEO Command Center
            </h2>
            <span className="bg-neutral-900 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded">
              Search & Generative AI Visibility
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage Search Engine Optimisation (Google/Bing) and Generative Engine Optimisation (ChatGPT, Perplexity, Claude, Gemini & Copilot). All changes automatically rebuild and synchronize 20 static files on disk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded cursor-pointer transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSyncFiles}
            disabled={syncingFiles || saving}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 disabled:opacity-50 rounded cursor-pointer flex items-center gap-1.5 transition-colors"
            title="Force regenerate and write all SEO, AEO, and GEO files to disk"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingFiles ? 'animate-spin' : ''}`} />
            <span>{syncingFiles ? 'Syncing...' : 'Sync All Files'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || syncingFiles}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className={`p-3 rounded-md flex items-center justify-between transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : toastType === 'info'
              ? 'bg-blue-50 text-blue-800 border border-blue-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 overflow-x-auto border-b border-neutral-200 bg-white p-1 rounded-lg border">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GLOBAL SEO & META */}
      {/* ========================================================================= */}
      {activeTab === 'global_seo' && (
        <div className="space-y-6">
          {/* Core Metadata */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Core Search Engine Metadata
            </h3>

            {/* Title with live counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-800">
                  Default Page Title
                </label>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    titleLen >= 50 && titleLen <= 60
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : titleLen < 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {titleLen} / 60 characters (Target: 50–60)
                </span>
              </div>
              <input
                type="text"
                value={formData.meta_title || ''}
                onChange={(e) => updateField('meta_title', e.target.value)}
                placeholder="OCT9 | Women's Luxury Ethnic Wear, Suits & Sarees"
                className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800"
              />
              <p className="text-[11px] text-neutral-500">
                Rule 1: Recommended 50–60 characters to prevent Google desktop and mobile truncation.
              </p>
            </div>

            {/* Description with live counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-800">
                  Default Meta Description
                </label>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    descLen >= 120 && descLen <= 160
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : descLen < 120
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {descLen} / 160 characters (Target: 120–160)
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.meta_description || ''}
                onChange={(e) => updateField('meta_description', e.target.value)}
                placeholder="Luxury without noise"
                className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800"
              />
              <p className="text-[11px] text-neutral-500">
                Rule 2: Recommended 120–160 characters describing store value proposition, pure fabrics, and fast pan-India delivery.
              </p>
            </div>

            {/* Canonical Base & Site Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Canonical Base URL (Root Domain)
                </label>
                <input
                  type="text"
                  value={formData.canonical_base_url || ''}
                  onChange={(e) => updateField('canonical_base_url', e.target.value)}
                  placeholder="https://oct9.in"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-mono focus:outline-neutral-800"
                />
                <p className="text-[11px] text-neutral-500">
                  Rule 3: Canonical tags are generated per-page (never in root index.html) using this primary apex domain.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Site Name (og:site_name)
                </label>
                <input
                  type="text"
                  value={formData.site_name || ''}
                  onChange={(e) => updateField('site_name', e.target.value)}
                  placeholder="OCT9 Luxury Ethnic Wear"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800"
                />
                <p className="text-[11px] text-neutral-500">
                  Used by Facebook, WhatsApp, and Google Discover to brand shared snippets.
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-800">
                Default Meta Keywords (Comma-Separated)
              </label>
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => updateField('keywords', e.target.value)}
                placeholder="OCT9, ethnic wear, suits, designer suits, anarkali suits, sarees, festive wear, indian fashion"
                className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800"
              />
            </div>
          </div>

          {/* Indexing & Thin Content Guardrails */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Robots Directives & Thin Content Protection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Global Default Robots Directive
                </label>
                <select
                  value={formData.robots_default || 'index, follow'}
                  onChange={(e) => updateField('robots_default', e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800 bg-white"
                >
                  <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
                    index, follow (Standard Production Indexing)
                  </option>
                  <option value="noindex, follow">
                    noindex, follow (Staging / Hide Search Results)
                  </option>
                  <option value="noindex, nofollow">
                    noindex, nofollow (Complete Block)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Thin Category Noindex Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.thin_category_threshold || 3}
                    onChange={(e) => updateField('thin_category_threshold', Number(e.target.value) || 3)}
                    className="w-24 text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800"
                  />
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.thin_category_noindex !== false}
                      onChange={(e) => updateField('thin_category_noindex', e.target.checked)}
                      className="accent-neutral-900 h-4 w-4"
                    />
                    <span>Automatically noindex categories with fewer than {formData.thin_category_threshold || 3} products (Rule 6)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Social Sharing & Open Graph */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Social Media Open Graph & Twitter Cards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-800">
                  Default Social Sharing Image (1200×630 recommended)
                </label>
                <input
                  type="text"
                  value={formData.og_image || ''}
                  onChange={(e) => updateField('og_image', e.target.value)}
                  placeholder="/oct9-logo.jpg"
                  className="w-full text-xs p-2 border border-neutral-300 rounded font-mono"
                />
                <ImageUploader
                  images={formData.og_image}
                  onChange={(url) => updateField('og_image', url)}
                  multiple={false}
                  label="Upload New Open Graph Image"
                  aspectRatio="aspect-[12/6]"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Twitter Card Format
                  </label>
                  <select
                    value={formData.twitter_card || 'summary_large_image'}
                    onChange={(e) => updateField('twitter_card', e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans bg-white"
                  >
                    <option value="summary_large_image">summary_large_image (Full Width Photo)</option>
                    <option value="summary">summary (Square Thumbnail)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitter_site || ''}
                    onChange={(e) => updateField('twitter_site', e.target.value)}
                    placeholder="@oct9india"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ========================================================================= */}
      {/* TAB 2: GEO (GENERATIVE ENGINE OPTIMISATION - AI OVERVIEWS, CHATGPT, PERPLEXITY) */}
      {/* ========================================================================= */}
      {activeTab === 'geo' && (
        <div className="space-y-6">
          {/* Top GEO Overview Banner */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                    Generative Engine Optimisation (GEO) Command Center
                  </h3>
                  <span className="bg-neutral-900 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                    LLMs & AI Search
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Optimize OCT9 for generative AI search engines, answer engines, and LLMs (ChatGPT Search, Perplexity AI, Google Gemini AI Overviews, Anthropic Claude, Microsoft Copilot, and DeepSeek).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200 text-neutral-700 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Autonomous Engine Status: Grounded</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">1. Knowledge Grounding</span>
                <p className="text-neutral-700 text-[11px]">
                  Factual brand narrative and structured entity tags injected into /llms.txt and JSON-LD Knowledge Graphs.
                </p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">2. Crawler Permissions</span>
                <p className="text-neutral-700 text-[11px]">
                  Configures robots.txt directives for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.
                </p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">3. Anti-Hallucination Anchor</span>
                <p className="text-neutral-700 text-[11px]">
                  Verified physical studio address in pure text prevents generative models from hallucinating false store details.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: Brand Narrative & Entity Grounding */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
                1. Generative Brand Narrative & Knowledge Grounding
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                This authoritative description is consumed by LLMs (ChatGPT, Claude, Gemini, Perplexity) when answering user queries about OCT9, its heritage, and product authenticity.
              </p>
            </div>

            {/* Factual Brand Narrative */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-800">
                Authoritative Brand Narrative for LLMs & Generative Answer Engines
              </label>
              <textarea
                rows={3}
                value={formData.aeo?.brand_summary || ''}
                onChange={(e) => updateAeoField('brand_summary', e.target.value)}
                placeholder="OCT9 is an authentic Indian luxury ethnic fashion brand based in New Delhi, India..."
                className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans focus:outline-neutral-800 leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500">
                Synchronized into /llms.txt, /llms-full.txt, and Schema.org Organization Knowledge Graph so AI models quote verified facts.
              </p>
            </div>

            {/* Primary Recognized Entities */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-800">
                Recognized Brand Entity Tags (Schema knowsAbout)
              </label>
              <input
                type="text"
                value={formData.aeo?.primary_entities || ''}
                onChange={(e) => updateAeoField('primary_entities', e.target.value)}
                placeholder="Luxury Ethnic Wear, Stitched Salwar Suits, Pure Mulberry Silk, Roman Silk, Handcrafted Zardozi..."
                className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
              />
              <p className="text-[11px] text-neutral-500">
                Comma-separated entities used by semantic crawlers to ground brand authority and product taxonomy.
              </p>
            </div>

            {/* Price Range & Persona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Target Price Range Tier (Structured Data)
                </label>
                <input
                  type="text"
                  value={formData.aeo?.price_range || ''}
                  onChange={(e) => updateAeoField('price_range', e.target.value)}
                  placeholder="₹1,499 - ₹12,999 (Tier: Accessible to Fine Luxury)"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Target Audience Persona
                </label>
                <input
                  type="text"
                  value={formData.aeo?.target_audience || ''}
                  onChange={(e) => updateAeoField('target_audience', e.target.value)}
                  placeholder="Women seeking high-craftsmanship authentic Indian heritage clothing..."
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: AI Crawlers & Model Access Control */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
                2. Autonomous AI Crawlers & Model Permissions (Robots.txt Policy)
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Control which AI engine crawlers are authorized to index store content, catalog items, and /llms.txt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* GPTBot */}
              <label className="flex items-start gap-2.5 p-3 border border-neutral-200 rounded text-xs cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={formData.aeo?.allow_gptbot !== false}
                  onChange={(e) => updateAeoField('allow_gptbot', e.target.checked)}
                  className="accent-neutral-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">GPTBot</span>
                  <span className="text-[11px] text-neutral-500">OpenAI ChatGPT & SearchGPT</span>
                </div>
              </label>

              {/* ClaudeBot */}
              <label className="flex items-start gap-2.5 p-3 border border-neutral-200 rounded text-xs cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={formData.aeo?.allow_claudebot !== false}
                  onChange={(e) => updateAeoField('allow_claudebot', e.target.checked)}
                  className="accent-neutral-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">ClaudeBot / anthropic-ai</span>
                  <span className="text-[11px] text-neutral-500">Anthropic Claude Assistant</span>
                </div>
              </label>

              {/* PerplexityBot */}
              <label className="flex items-start gap-2.5 p-3 border border-neutral-200 rounded text-xs cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={formData.aeo?.allow_perplexitybot !== false}
                  onChange={(e) => updateAeoField('allow_perplexitybot', e.target.checked)}
                  className="accent-neutral-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">PerplexityBot</span>
                  <span className="text-[11px] text-neutral-500">Perplexity AI Answer Engine</span>
                </div>
              </label>

              {/* Google-Extended */}
              <label className="flex items-start gap-2.5 p-3 border border-neutral-200 rounded text-xs cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={formData.aeo?.allow_google_extended !== false}
                  onChange={(e) => updateAeoField('allow_google_extended', e.target.checked)}
                  className="accent-neutral-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">Google-Extended</span>
                  <span className="text-[11px] text-neutral-500">Gemini & Vertex AI Training</span>
                </div>
              </label>

              {/* CCBot */}
              <label className="flex items-start gap-2.5 p-3 border border-neutral-200 rounded text-xs cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={Boolean(formData.aeo?.allow_ccbot)}
                  onChange={(e) => updateAeoField('allow_ccbot', e.target.checked)}
                  className="accent-neutral-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">CCBot (Common Crawl)</span>
                  <span className="text-[11px] text-neutral-500">Open Web Training Sets</span>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 3: Generative AI Citation & Search Simulator */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  3. Generative AI Query & Citation Simulator
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Live simulation of how ChatGPT Search, Perplexity AI, or Google AI Overviews cite OCT9 based on your configured GEO parameters.
                </p>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                Simulated AI Engine
              </span>
            </div>

            <div className="border border-neutral-200 rounded p-4 bg-neutral-50 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <Bot className="w-4 h-4 text-neutral-700" />
                <span>Simulated Query: &ldquo;Where can I buy authentic luxury ethnic wear and stitched silk suits in Delhi?&rdquo;</span>
              </div>

              <div className="bg-white p-4 rounded border border-neutral-200 space-y-2 text-xs text-neutral-800 leading-relaxed">
                <p>
                  According to official brand documentation, <strong className="font-bold text-neutral-900">{formData.geo?.store_name || formData.site_name || 'OCT9'}</strong> is a verified Indian luxury ethnic fashion house established in {formData.geo?.city || 'New Delhi'}, India.
                </p>
                <p className="text-neutral-700">
                  {formData.aeo?.brand_summary || 'OCT9 specializes in handcrafted stitched suits, pure unstitched silks, and designer sarees crafted from authentic Mulberry silk, Chanderi, and organza with hand-embroidered zardozi and gota patti.'}
                </p>

                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold text-neutral-500">Cited Sources:</span>
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-700 font-mono">
                    [1] {formData.canonical_base_url || 'https://oct9.in'}/category/stitched-suits
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-700 font-mono">
                    [2] {formData.canonical_base_url || 'https://oct9.in'}/about
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-700 font-mono">
                    [3] {formData.canonical_base_url || 'https://oct9.in'}/llms.txt
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Verified Physical Entity Grounding (Anti-Hallucination Anchor) */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  4. Verified Physical Entity Grounding (Anti-Hallucination Anchor)
                </h4>
                <span className="bg-neutral-100 text-neutral-700 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-200">
                  Address in Text (Changeable)
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Generative AI models require verified physical entity grounding in plain text to anchor store authority, calculate delivery logistics, and avoid hallucinating false store addresses. All text fields remain completely editable.
              </p>
            </div>

            {/* Interactive Map Picker */}
            <div className="space-y-2 border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5A1827]" />
                    <span>Locate Studio on Interactive Map</span>
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Search area or drop a pin. The map automatically resolves into pure text components in the editable fields below.
                  </p>
                </div>
              </div>

              <GeoMapPicker
                initialLocation={{
                  latitude: formData.geo?.latitude,
                  longitude: formData.geo?.longitude,
                  street_address: formData.geo?.street_address,
                  full_address: formData.geo?.full_address,
                  city: formData.geo?.city || formData.geo?.geo_placename,
                  state: formData.geo?.state,
                  geo_region: formData.geo?.geo_region,
                  postal_code: formData.geo?.postal_code,
                  country: formData.geo?.country,
                  country_code: formData.geo?.country_code
                }}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {/* Editable Plain Text Address Fields */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
                Editable Studio Address & Communication Details (Text)
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Business Schema Type
                  </label>
                  <select
                    value={formData.geo?.business_type || 'FashionStore'}
                    onChange={(e) => updateGeoField('business_type', e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans bg-white"
                  >
                    <option value="FashionStore">FashionStore (Clothing & Apparel)</option>
                    <option value="ClothingStore">ClothingStore</option>
                    <option value="Store">Store (General Retail)</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Studio / Store Display Name (Text)
                  </label>
                  <input
                    type="text"
                    value={formData.geo?.store_name || ''}
                    onChange={(e) => updateGeoField('store_name', e.target.value)}
                    placeholder="OCT9 Flagship Studio"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Street Address Line (Text - Editable)
                </label>
                <input
                  type="text"
                  value={formData.geo?.street_address || ''}
                  onChange={(e) => updateGeoField('street_address', e.target.value)}
                  placeholder="Plot 42, Fashion Hub, Shahpur Jat"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800">
                  Full Postal Display Address (Text - Editable)
                </label>
                <input
                  type="text"
                  value={formData.geo?.full_address || ''}
                  onChange={(e) => updateGeoField('full_address', e.target.value)}
                  placeholder="Plot 42, Fashion Hub, Shahpur Jat, New Delhi, Delhi 110049, India"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">City / Placename (Text)</label>
                  <input
                    type="text"
                    value={formData.geo?.city || formData.geo?.geo_placename || ''}
                    onChange={(e) => {
                      updateGeoField('city', e.target.value);
                      updateGeoField('geo_placename', e.target.value);
                    }}
                    placeholder="New Delhi"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">State / Region (Text)</label>
                  <input
                    type="text"
                    value={formData.geo?.state || ''}
                    onChange={(e) => updateGeoField('state', e.target.value)}
                    placeholder="Delhi"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Postal PIN Code (Text)</label>
                  <input
                    type="text"
                    value={formData.geo?.postal_code || ''}
                    onChange={(e) => updateGeoField('postal_code', e.target.value)}
                    placeholder="110049"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Country (Text)</label>
                  <input
                    type="text"
                    value={formData.geo?.country || 'India'}
                    onChange={(e) => updateGeoField('country', e.target.value)}
                    placeholder="India"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Customer Support Phone</label>
                  <input
                    type="text"
                    value={formData.geo?.telephone || ''}
                    onChange={(e) => updateGeoField('telephone', e.target.value)}
                    placeholder="+91 9667100863"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Customer Support Email</label>
                  <input
                    type="email"
                    value={formData.geo?.email || ''}
                    onChange={(e) => updateGeoField('email', e.target.value)}
                    placeholder="support@oct9.in"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.geo?.opening_hours || ''}
                    onChange={(e) => updateGeoField('opening_hours', e.target.value)}
                    placeholder="Mo-Sa 10:00-19:30"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-neutral-800">Service Radius / Delivery Coverage</label>
                <input
                  type="text"
                  value={formData.geo?.service_area || ''}
                  onChange={(e) => updateGeoField('service_area', e.target.value)}
                  placeholder="All India Standard Delivery (Insured Surface Logistics)"
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded font-sans"
                />
              </div>
            </div>

            {/* Generated Code Snippet Preview */}
            <div className="bg-neutral-900 text-neutral-200 p-4 rounded text-xs font-mono space-y-2 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-1.5 text-[11px] font-sans">
                <span className="font-semibold text-white">Generated Search Engine Meta Tags & Structured Data</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">W3C & Google Compliant</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-emerald-400 overflow-x-auto whitespace-pre">
{`<!-- Synchronized Geographic Meta Tags -->
<meta name="geo.region" content="${formData.geo?.geo_region || 'IN-DL'}" />
<meta name="geo.placename" content="${formData.geo?.geo_placename || formData.geo?.city || 'New Delhi'}" />
<meta name="geo.position" content="${formData.geo?.geo_position || `${formData.geo?.latitude || '28.5535'};${formData.geo?.longitude || '77.2066'}`}" />
<meta name="ICBM" content="${formData.geo?.icbm || `${formData.geo?.latitude || '28.5535'}, ${formData.geo?.longitude || '77.2066'}`}" />

<!-- Schema.org ${formData.geo?.business_type || 'FashionStore'} GeoCoordinates -->
"geo": {
  "@type": "GeoCoordinates",
  "latitude": "${formData.geo?.latitude || '28.5535'}",
  "longitude": "${formData.geo?.longitude || '77.2066'}"
}`}
              </pre>
            </div>
          </div>

          {/* SECTION 5: Machine-Readable Generative Feeds & Manifests */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  5. Machine-Readable Generative Feeds & Endpoints
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Standardized machine endpoints automatically written to disk for autonomous agents and LLM scrapers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-neutral-900">/llms.txt</span>
                  <span className="text-[11px] text-neutral-500">Concise AI Model Spec</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                href="/llms-full.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-neutral-900">/llms-full.txt</span>
                  <span className="text-[11px] text-neutral-500">Deep Brand & Fit Spec</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                href="/ai-catalog.json"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-neutral-900">/ai-catalog.json</span>
                  <span className="text-[11px] text-neutral-500">Agentic Discovery (ARD)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                href="/.well-known/agent-card.json"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-neutral-900">/agent-card.json</span>
                  <span className="text-[11px] text-neutral-500">A2A Agent Spec</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PER-PAGE SEO OVERRIDES */}
      {/* ========================================================================= */}
      {activeTab === 'page_overrides' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Per-Page Title & Description Overrides
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Tailor unique title tags, meta descriptions, and indexing directives for specific landing pages and policy URLs.
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Page Name</th>
                    <th className="py-2.5 px-3">Path</th>
                    <th className="py-2.5 px-3">Title Length</th>
                    <th className="py-2.5 px-3">Description Length</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {Object.entries(formData.page_overrides || {}).map(([key, item]) => {
                    const pTitleLen = (item.title || '').length;
                    const pDescLen = (item.description || '').length;
                    return (
                      <tr key={key} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-neutral-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-600">
                          {item.path}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                              pTitleLen >= 50 && pTitleLen <= 60
                                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {pTitleLen} chars
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                              pDescLen >= 120 && pDescLen <= 160
                                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {pDescLen} chars
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.noindex ? (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
                              noindex
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              indexed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingPageKey(editingPageKey === key ? null : key)}
                            className="px-2.5 py-1 text-xs border border-neutral-300 rounded hover:bg-neutral-100 font-medium cursor-pointer"
                          >
                            {editingPageKey === key ? 'Close' : 'Edit'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inline Editor Drawer */}
            {editingPageKey && formData.page_overrides?.[editingPageKey] && (
              <div className="p-4 border border-neutral-300 bg-neutral-50 rounded space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-neutral-900">
                    Editing SEO for: <span className="capitalize">{editingPageKey.replace(/_/g, ' ')}</span> ({formData.page_overrides[editingPageKey].path})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingPageKey(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                  >
                    Done Editing
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800">Page Title</label>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {(formData.page_overrides[editingPageKey].title || '').length} / 60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.page_overrides[editingPageKey].title || ''}
                    onChange={(e) => updatePageOverride(editingPageKey, 'title', e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded font-sans bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800">Meta Description</label>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {(formData.page_overrides[editingPageKey].description || '').length} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.page_overrides[editingPageKey].description || ''}
                    onChange={(e) => updatePageOverride(editingPageKey, 'description', e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded font-sans bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`noindex-${editingPageKey}`}
                    checked={Boolean(formData.page_overrides[editingPageKey].noindex)}
                    onChange={(e) => updatePageOverride(editingPageKey, 'noindex', e.target.checked)}
                    className="accent-neutral-900 h-4 w-4"
                  />
                  <label htmlFor={`noindex-${editingPageKey}`} className="text-xs text-neutral-800 cursor-pointer">
                    Apply <span className="font-mono text-red-600">noindex, follow</span> directive to this page
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYNCHRONIZED FILES & PREVIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'previews' && (
        <div className="space-y-6">
          {/* Google SERP Preview Card */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Google Desktop Search Snippet Simulation
            </h3>

            <div className="p-4 bg-white border border-neutral-200 rounded max-w-2xl space-y-1 font-sans">
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <span className="bg-neutral-100 rounded-full p-1 border border-neutral-200 inline-flex items-center justify-center w-5 h-5 font-bold text-[10px]">
                  9
                </span>
                <span className="text-neutral-800 truncate">{formData.canonical_base_url || 'https://oct9.in'}</span>
                <span className="text-neutral-400">›</span>
              </div>
              <h4 className="text-lg text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 font-medium">
                {formData.meta_title || "OCT9 | Women's Luxury Ethnic Wear, Suits & Sarees"}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {formData.meta_description || "Shop women's ethnic wear, designer suits, anarkalis, and sarees at OCT9. Fast shipping across India with secure payment options."}
              </p>
            </div>
          </div>

          {/* Google Local Business / Studio Knowledge Card Simulation */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Google Local Knowledge Panel & Maps Grounding
            </h3>

            <div className="p-4 bg-white border border-neutral-200 rounded max-w-2xl space-y-3 font-sans">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {formData.geo?.business_type || 'FashionStore'} &bull; Verified Entity
                  </div>
                  <h4 className="text-base font-bold text-neutral-900">
                    {formData.geo?.store_name || 'OCT9 Flagship Studio'}
                  </h4>
                  <p className="text-xs text-neutral-600">
                    {formData.geo?.full_address || `${formData.geo?.street_address || ''}, ${formData.geo?.city || ''} ${formData.geo?.postal_code || ''}`}
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${formData.geo?.latitude || '28.5535'},${formData.geo?.longitude || '77.2066'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold text-neutral-800 rounded hover:bg-neutral-50 flex items-center gap-1.5 shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#5A1827]" />
                  <span>View on Map</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600 font-mono">
                <div>
                  <span className="font-sans text-neutral-400 block">Coordinates:</span>
                  <span className="font-semibold text-neutral-800">{formData.geo?.latitude || '28.5535'}, {formData.geo?.longitude || '77.2066'}</span>
                </div>
                <div>
                  <span className="font-sans text-neutral-400 block">geo.position:</span>
                  <span className="font-semibold text-neutral-800">{formData.geo?.geo_position || `${formData.geo?.latitude || '28.5535'};${formData.geo?.longitude || '77.2066'}`}</span>
                </div>
                <div>
                  <span className="font-sans text-neutral-400 block">ICBM:</span>
                  <span className="font-semibold text-neutral-800">{formData.geo?.icbm || `${formData.geo?.latitude || '28.5535'}, ${formData.geo?.longitude || '77.2066'}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Share Preview (WhatsApp / Facebook) */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              WhatsApp & Facebook Rich Social Preview
            </h3>

            <div className="border border-neutral-300 rounded max-w-md bg-neutral-100 overflow-hidden">
              <div className="h-44 bg-neutral-200 overflow-hidden">
                <img
                  src={formData.og_image || '/oct9-logo.jpg'}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-white space-y-1 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                  {formData.canonical_base_url?.replace(/^https?:\/\//, '') || 'OCT9.IN'}
                </span>
                <p className="font-bold text-xs text-neutral-900 line-clamp-1">
                  {formData.meta_title}
                </p>
                <p className="text-[11px] text-neutral-600 line-clamp-2 leading-snug">
                  {formData.meta_description}
                </p>
              </div>
            </div>
          </div>

          {/* Managed SEO, AEO & GEO Files Synchronization Status */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-neutral-800" />
                  <span>Synchronized SEO, AEO & GEO Static Files</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Every edit to SEO, AEO, or GEO automatically generates and writes the updated static files to disk for search engines, LLM answer engines, and mobile web apps.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncFiles}
                disabled={syncingFiles || saving}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 disabled:opacity-50 rounded cursor-pointer flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingFiles ? 'animate-spin' : ''}`} />
                <span>{syncingFiles ? 'Synchronizing...' : 'Regenerate All Files'}</span>
              </button>
            </div>

            {lastSyncResult && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">
                    Last synchronized: {new Date(lastSyncResult.timestamp || Date.now()).toLocaleTimeString()} ({lastSyncResult.updated_files?.length || 0} files written to disk)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">Live on Disk</span>
              </div>
            )}

            {/* High-density file table */}
            <div className="overflow-x-auto border border-neutral-200 rounded">
              <table className="w-full text-left text-xs divide-y divide-neutral-200 font-sans">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">File Path</th>
                    <th className="py-2.5 px-3">Standard / Protocol</th>
                    <th className="py-2.5 px-3">Target Consumer</th>
                    <th className="py-2.5 px-3 text-right">Direct Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white text-neutral-800">
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/llms.txt</td>
                    <td className="py-2 px-3 text-neutral-600">llmstxt.org Specification</td>
                    <td className="py-2 px-3 text-neutral-600">ChatGPT, Perplexity, Claude, SearchGPT</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/llms.txt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/llms-full.txt</td>
                    <td className="py-2 px-3 text-neutral-600">Deep AI Agent Documentation</td>
                    <td className="py-2 px-3 text-neutral-600">Autonomous Shopping & Sizing Agents</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/llms-full.txt" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/llms-full.txt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/robots.txt</td>
                    <td className="py-2 px-3 text-neutral-600">Crawler Directives + AEO Bot Control</td>
                    <td className="py-2 px-3 text-neutral-600">Googlebot, Bingbot, GPTBot, ClaudeBot</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/robots.txt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/sitemap.xml</td>
                    <td className="py-2 px-3 text-neutral-600">XML Sitemap Protocol 0.9</td>
                    <td className="py-2 px-3 text-neutral-600">Search Engine Indexers & Discovery Spiders</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/sitemap.xml</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/ai-catalog.json</td>
                    <td className="py-2 px-3 text-neutral-600">Agentic Resource Discovery (ARD 1.0)</td>
                    <td className="py-2 px-3 text-neutral-600">MCP Clients, Tool-Using AI Systems</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/ai-catalog.json" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/ai-catalog.json</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/.well-known/agent-card.json</td>
                    <td className="py-2 px-3 text-neutral-600">A2A Agent Card Standard</td>
                    <td className="py-2 px-3 text-neutral-600">Autonomous Customer Care Agents</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/.well-known/agent-card.json" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/agent-card.json</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/public/manifest.json</td>
                    <td className="py-2 px-3 text-neutral-600">W3C Web App Manifest (PWA)</td>
                    <td className="py-2 px-3 text-neutral-600">Mobile Browsers, Install Prompts & OS Home Screen</td>
                    <td className="py-2 px-3 text-right">
                      <a href="/manifest.json" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-neutral-900 font-mono underline inline-flex items-center gap-1">
                        <span>/manifest.json</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-neutral-900">client/index.html</td>
                    <td className="py-2 px-3 text-neutral-600">Static HTML Head Meta & GEO Tags</td>
                    <td className="py-2 px-3 text-neutral-600">Social Scrapers (WhatsApp, Facebook, Twitter)</td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-neutral-500 font-mono text-[11px]">Primary Root</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Direct Links */}
          <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-2">
              Live Backend Crawl & Sitemap Endpoints
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="https://backend.oct9.in/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 text-xs text-neutral-800 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block">Dynamic sitemap.xml</span>
                  <span className="text-[11px] text-neutral-500">Googlebot Index Feed</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                href="https://backend.oct9.in/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 text-xs text-neutral-800 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block">Dynamic robots.txt</span>
                  <span className="text-[11px] text-neutral-500">Crawler Directives</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                href="https://backend.oct9.in/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 rounded hover:border-neutral-400 text-xs text-neutral-800 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block">Dynamic llms.txt</span>
                  <span className="text-[11px] text-neutral-500">AI Model Knowledge Spec</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSeoManager;
