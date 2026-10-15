import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Compass,
  Link2,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useContent, DEFAULT_NAV_LINKS } from '../../context/ContentContext.jsx';
import { Link } from 'react-router-dom';

// Quick Category Presets for fast 1-click addition
const PRESET_TABS = [
  { label: 'Home', path: '/', badge: '' },
  { label: 'New Arrivals', path: '/new-arrivals', badge: 'NEW' },
  { label: 'Stitched Suits', path: '/category/stitched-suits', badge: '' },
  { label: 'Unstitched Suits', path: '/category/unstitched-suits', badge: '' },
  { label: 'Designer Suits', path: '/category/designer-suits', badge: '' },
  { label: 'Festive Wear', path: '/category/festive-wear', badge: '' },
  { label: 'Party Wear', path: '/category/party-wear', badge: '' },
  { label: 'Sarees', path: '/category/sarees', badge: '' },
  { label: 'Accessories', path: '/category/accessories', badge: '' },
  { label: 'Jutti', path: '/category/jutti', badge: '' },
  { label: 'Sale', path: '/category/all?sort=discount', badge: 'SALE' },
  { label: 'Size Guide', path: '/size-guide', badge: '' },
  { label: 'Track Order', path: '/track-order', badge: '' },
  { label: 'Contact Us', path: '/contact', badge: '' }
];

// Contextual subcategory suggestions for common parent tabs
const SUBCATEGORY_PRESETS = {
  'stitched-suits': [
    { label: 'All Stitched Suits', path: '/category/stitched-suits' },
    { label: 'Farshi Salwar Suits', path: '/category/stitched-suits?sub_category=Farshi+Salwar+Suit' },
    { label: 'Palazzo Suits', path: '/category/stitched-suits?sub_category=Palazzo+Suit' },
    { label: 'Sharara Suits', path: '/category/stitched-suits?sub_category=Sharara+Suit' },
    { label: 'Anarkali Suits', path: '/category/stitched-suits?sub_category=Anarkali+Suits' },
    { label: 'Straight Fit Suits', path: '/category/stitched-suits?sub_category=Straight+Suit' }
  ],
  'unstitched-suits': [
    { label: 'All Unstitched Suits', path: '/category/unstitched-suits' },
    { label: 'Cotton Suits', path: '/category/unstitched-suits?sub_category=Cotton+Suit' },
    { label: 'Mulberry Silk Suits', path: '/category/unstitched-suits?sub_category=Mulberry+Suit' },
    { label: 'Roman Silk Suits', path: '/category/unstitched-suits?sub_category=Roman+Suit' },
    { label: 'Chanderi Silk Suits', path: '/category/unstitched-suits?sub_category=Chanderi+Suit' }
  ],
  'sarees': [
    { label: 'All Sarees', path: '/category/sarees' },
    { label: 'Silk Sarees', path: '/category/sarees?sub_category=Silk+Saree' },
    { label: 'Organza Sarees', path: '/category/sarees?sub_category=Organza+Saree' },
    { label: 'Banarasi Sarees', path: '/category/sarees?sub_category=Banarasi+Saree' },
    { label: 'Kanjivaram Sarees', path: '/category/sarees?sub_category=Kanjivaram+Saree' }
  ],
  'accessories': [
    { label: 'All Accessories', path: '/category/accessories' },
    { label: 'Rings', path: '/category/accessories?sub_category=Ring' },
    { label: 'Earrings', path: '/category/accessories?sub_category=Earrings' },
    { label: 'Necklaces', path: '/category/accessories?sub_category=Necklace' },
    { label: 'Bangles & Kadas', path: '/category/accessories?sub_category=Bangles' },
    { label: 'Maang Tikka', path: '/category/accessories?sub_category=Maang+Tikka' }
  ],
  'jutti': [
    { label: 'All Juttis', path: '/category/jutti' },
    { label: 'Embroidered Mojaris', path: '/category/jutti?sub_category=Mojari' },
    { label: 'Leather Juttis', path: '/category/jutti?sub_category=Leather+Jutti' },
    { label: 'Bridal Juttis', path: '/category/jutti?sub_category=Bridal+Jutti' }
  ]
};

export function AdminNavigation({ isEmbedded = false }) {
  const { content, updateContent, resetSection, refreshContent } = useContent();

  const [navLinks, setNavLinks] = useState([]);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [activePreviewDropdown, setActivePreviewDropdown] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [hasChanges, setHasChanges] = useState(false);

  // New Tab form state
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabPath, setNewTabPath] = useState('');
  const [newTabBadge, setNewTabBadge] = useState('');
  const [newTabHasDropdown, setNewTabHasDropdown] = useState(false);

  // Load existing nav_links or fallback to default
  useEffect(() => {
    if (content && Array.isArray(content.nav_links) && content.nav_links.length > 0) {
      setNavLinks(JSON.parse(JSON.stringify(content.nav_links)));
    } else {
      setNavLinks(JSON.parse(JSON.stringify(DEFAULT_NAV_LINKS)));
    }
  }, [content]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle dropdown accordion
  const toggleDropdownExpand = (tabId) => {
    setExpandedDropdowns((prev) => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  // Add a brand-new tab
  const handleAddTab = (e) => {
    if (e) e.preventDefault();
    if (!newTabLabel.trim() || !newTabPath.trim()) {
      showToast('Please provide both Tab Label and Link Path.', 'error');
      return;
    }

    const newId = `nav-${Date.now()}`;
    const newTab = {
      id: newId,
      label: newTabLabel.trim(),
      path: newTabPath.trim().startsWith('/') || newTabPath.trim().startsWith('http') ? newTabPath.trim() : `/${newTabPath.trim()}`,
      badge: newTabBadge.trim().toUpperCase(),
      active: true,
      children: newTabHasDropdown ? [
        {
          id: `sub-${Date.now()}-1`,
          label: `All ${newTabLabel.trim()}`,
          path: newTabPath.trim().startsWith('/') || newTabPath.trim().startsWith('http') ? newTabPath.trim() : `/${newTabPath.trim()}`
        }
      ] : []
    };

    setNavLinks((prev) => [...prev, newTab]);
    if (newTabHasDropdown) {
      setExpandedDropdowns((prev) => ({ ...prev, [newId]: true }));
    }

    // Reset inputs
    setNewTabLabel('');
    setNewTabPath('');
    setNewTabBadge('');
    setNewTabHasDropdown(false);
    setHasChanges(true);
    showToast(`Added tab "${newTab.label}" to navigation.`, 'success');
  };

  // Add from Quick Preset
  const handleAddPreset = (preset) => {
    const newId = `nav-${Date.now()}`;
    // Check if preset matches known subcategories
    const slug = preset.path.replace('/category/', '').split('?')[0];
    const subPresets = SUBCATEGORY_PRESETS[slug] || [];

    const newTab = {
      id: newId,
      label: preset.label,
      path: preset.path,
      badge: preset.badge || '',
      active: true,
      children: subPresets.length > 0 ? JSON.parse(JSON.stringify(subPresets)) : []
    };

    setNavLinks((prev) => [...prev, newTab]);
    if (subPresets.length > 0) {
      setExpandedDropdowns((prev) => ({ ...prev, [newId]: true }));
    }
    setHasChanges(true);
    showToast(`Added "${preset.label}" to navigation!`, 'success');
  };

  // Update top-level tab field
  const handleTabChange = (index, field, value) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  // Toggle active status
  const handleToggleActive = (index) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], active: updated[index].active === false ? true : false };
      return updated;
    });
    setHasChanges(true);
  };

  // Move tab up
  const handleMoveTabUp = (index) => {
    if (index === 0) return;
    setNavLinks((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
    setHasChanges(true);
  };

  // Move tab down
  const handleMoveTabDown = (index) => {
    if (index >= navLinks.length - 1) return;
    setNavLinks((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
    setHasChanges(true);
  };

  // Delete tab
  const handleDeleteTab = (index) => {
    const tabName = navLinks[index]?.label || 'this tab';
    if (!window.confirm(`Are you sure you want to remove the "${tabName}" tab from header navigation?`)) return;

    setNavLinks((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
    showToast(`Removed tab "${tabName}".`, 'success');
  };

  // -------------------------------------------------------------
  // Dropdown Sub-links handlers
  // -------------------------------------------------------------

  // Add empty dropdown link
  const handleAddDropdownItem = (tabIndex) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      const currentChildren = Array.isArray(updated[tabIndex].children) ? updated[tabIndex].children : [];
      const newChild = {
        id: `sub-${Date.now()}`,
        label: 'New Sub-Link',
        path: updated[tabIndex].path || '/'
      };
      updated[tabIndex] = {
        ...updated[tabIndex],
        children: [...currentChildren, newChild]
      };
      return updated;
    });
    // Ensure dropdown is expanded
    setExpandedDropdowns((prev) => ({
      ...prev,
      [navLinks[tabIndex].id]: true
    }));
    setHasChanges(true);
  };

  // Populate subcategories from preset
  const handlePopulatePresets = (tabIndex, presetList) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      const existing = updated[tabIndex].children || [];
      const existingPaths = new Set(existing.map((e) => e.path));
      const toAdd = presetList.filter((p) => !existingPaths.has(p.path));

      updated[tabIndex] = {
        ...updated[tabIndex],
        children: [...existing, ...JSON.parse(JSON.stringify(toAdd))]
      };
      return updated;
    });
    setExpandedDropdowns((prev) => ({
      ...prev,
      [navLinks[tabIndex].id]: true
    }));
    setHasChanges(true);
    showToast(`Added ${presetList.length} subcategory links!`, 'success');
  };

  // Update dropdown sub-item field
  const handleDropdownItemChange = (tabIndex, childIndex, field, value) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      const children = [...(updated[tabIndex].children || [])];
      children[childIndex] = { ...children[childIndex], [field]: value };
      updated[tabIndex] = { ...updated[tabIndex], children };
      return updated;
    });
    setHasChanges(true);
  };

  // Move dropdown sub-item up
  const handleMoveDropdownItemUp = (tabIndex, childIndex) => {
    if (childIndex === 0) return;
    setNavLinks((prev) => {
      const updated = [...prev];
      const children = [...(updated[tabIndex].children || [])];
      const temp = children[childIndex - 1];
      children[childIndex - 1] = children[childIndex];
      children[childIndex] = temp;
      updated[tabIndex] = { ...updated[tabIndex], children };
      return updated;
    });
    setHasChanges(true);
  };

  // Move dropdown sub-item down
  const handleMoveDropdownItemDown = (tabIndex, childIndex) => {
    const total = (navLinks[tabIndex]?.children || []).length;
    if (childIndex >= total - 1) return;
    setNavLinks((prev) => {
      const updated = [...prev];
      const children = [...(updated[tabIndex].children || [])];
      const temp = children[childIndex + 1];
      children[childIndex + 1] = children[childIndex];
      children[childIndex] = temp;
      updated[tabIndex] = { ...updated[tabIndex], children };
      return updated;
    });
    setHasChanges(true);
  };

  // Delete dropdown sub-item
  const handleDeleteDropdownItem = (tabIndex, childIndex) => {
    setNavLinks((prev) => {
      const updated = [...prev];
      const children = (updated[tabIndex].children || []).filter((_, i) => i !== childIndex);
      updated[tabIndex] = { ...updated[tabIndex], children };
      return updated;
    });
    setHasChanges(true);
  };

  // Save changes to database
  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanNavLinks = navLinks.map((tab, idx) => ({
        id: tab.id || `nav-${idx + 1}`,
        label: (tab.label || '').trim(),
        path: (tab.path || '').trim(),
        badge: (tab.badge || '').trim().toUpperCase(),
        active: tab.active !== false,
        children: Array.isArray(tab.children)
          ? tab.children
              .filter((c) => c && c.label && c.label.trim())
              .map((c, cIdx) => ({
                id: c.id || `sub-${idx}-${cIdx}`,
                label: c.label.trim(),
                path: (c.path || '').trim()
              }))
          : []
      }));

      const res = await updateContent({
        ...content,
        nav_links: cleanNavLinks
      });

      if (res.success) {
        setHasChanges(false);
        showToast('Navigation tab links and dropdown menus saved successfully!', 'success');
        refreshContent();
      } else {
        showToast(res.message || 'Failed to save navigation links.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error occurred while saving.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all header navigation tab links and dropdown menus to factory system defaults?')) return;

    setSaving(true);
    try {
      const res = await resetSection('nav_links');
      if (res.success) {
        setNavLinks(JSON.parse(JSON.stringify(DEFAULT_NAV_LINKS)));
        setHasChanges(false);
        showToast('Navigation tab links reset to system defaults!', 'success');
        refreshContent();
      } else {
        // Fallback local reset
        setNavLinks(JSON.parse(JSON.stringify(DEFAULT_NAV_LINKS)));
        await updateContent({ ...content, nav_links: DEFAULT_NAV_LINKS });
        setHasChanges(false);
        showToast('Navigation tab links reset to defaults.', 'success');
        refreshContent();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto pb-16 font-sans ${isEmbedded ? '' : 'p-4 md:p-6'}`}>
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 sm:p-5 rounded-md border border-neutral-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-neutral-500 mb-1">
            <Link to="/admin" className="hover:text-neutral-900 transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Header Navigation</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-neutral-700" />
            <span>Header Navigation &amp; Tab Links</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage top navigation bar tabs, custom category URLs, promotional badges, and multi-tier dropdown menus.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Restore default Oct9 navigation tabs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : hasChanges ? 'Save Changes *' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-md flex items-center justify-between transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-medium">
            {toastType === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Unsaved changes notice */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>You have unsaved navigation changes. Click <strong>Save Changes</strong> above to publish them to the live storefront.</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="underline font-bold hover:text-amber-950 cursor-pointer text-xs"
          >
            Save Now
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: LIVE STOREFRONT HEADER PREVIEW */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-neutral-200 overflow-hidden shadow-xs">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-neutral-600" />
            <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Live Storefront Navigation Preview
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Interactive: Hover over tabs with dropdowns to preview child menus
          </span>
        </div>

        {/* Simulated Desktop Header Strip */}
        <div className="p-4 bg-neutral-100/70 border-b border-neutral-200">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-xs max-w-full overflow-x-auto">
            <div className="px-4 py-2 flex items-center justify-center space-x-1 min-w-max">
              {navLinks.filter((t) => t.active !== false).map((link) => {
                const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                return (
                  <div
                    key={link.id}
                    className="relative group"
                    onMouseEnter={() => hasChildren && setActivePreviewDropdown(link.id)}
                    onMouseLeave={() => hasChildren && setActivePreviewDropdown(null)}
                  >
                    <div
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-[#5A1827] hover:bg-[#FAF7F2] rounded transition-colors cursor-pointer select-none"
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="bg-[#5A1827] text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                          {link.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-[#5A1827] transition-transform group-hover:rotate-180" />
                      )}
                    </div>

                    {/* Preview Subcategory Dropdown */}
                    {hasChildren && activePreviewDropdown === link.id && (
                      <div className="absolute left-0 top-full w-52 bg-white border border-neutral-200 shadow-lg rounded-b-md py-1 z-30 animate-fadeIn">
                        {link.children.map((sub, sIdx) => (
                          <div
                            key={sub.id || sIdx}
                            className="block px-3 py-1.5 text-xs text-neutral-700 hover:bg-[#FAF7F2] hover:text-[#5A1827] transition-colors"
                          >
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: ADD NEW TAB LINK FORM */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-md border border-neutral-200 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-neutral-700" />
              <span>Add New Header Tab Link</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Create a custom navigation item to link to a category, collection, seasonal page, or policy.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tab Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTabLabel}
              onChange={(e) => setNewTabLabel(e.target.value)}
              placeholder="e.g. Kurtis, Lehengas"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:border-neutral-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Destination URL / Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTabPath}
              onChange={(e) => setNewTabPath(e.target.value)}
              placeholder="e.g. /category/kurtis"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:border-neutral-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Badge Text <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={newTabBadge}
              onChange={(e) => setNewTabBadge(e.target.value)}
              placeholder="e.g. NEW, HOT, SALE"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:border-neutral-900 focus:outline-none uppercase"
            />
          </div>

          <div className="flex items-center h-10 px-1">
            <label className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTabHasDropdown}
                onChange={(e) => setNewTabHasDropdown(e.target.checked)}
                className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-0"
              />
              <span className="font-medium">Enable Dropdown Menu</span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tab</span>
            </button>
          </div>
        </form>

        {/* Quick Add Presets Strip */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              Quick 1-Click Category Shortcuts:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TABS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="px-2.5 py-1 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded border border-neutral-200 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>+ {preset.label}</span>
                {preset.badge && (
                  <span className="text-[9px] font-bold text-[#5A1827] bg-[#FBF1F3] px-1 rounded">
                    {preset.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: ACTIVE NAVIGATION TABS & DROPDOWN ACCORDIONS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              <span>Configured Tab Links ({navLinks.length})</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Drag or use Up/Down arrows to reorder. Toggle visibility or expand "Manage Dropdown" to configure sub-links.
            </p>
          </div>
          <span className="text-xs text-neutral-500">
            {navLinks.filter((t) => t.active !== false).length} visible tabs
          </span>
        </div>

        {/* Tab Links List */}
        <div className="divide-y divide-neutral-200">
          {navLinks.map((tab, index) => {
            const hasChildren = Array.isArray(tab.children) && tab.children.length > 0;
            const isExpanded = !!expandedDropdowns[tab.id];
            const childCount = (tab.children || []).length;
            const slug = tab.path.replace('/category/', '').split('?')[0];
            const presetSuggestions = SUBCATEGORY_PRESETS[slug] || [];

            return (
              <div
                key={tab.id || index}
                className={`transition-colors ${tab.active === false ? 'bg-neutral-50/70 opacity-75' : 'bg-white'}`}
              >
                {/* Main Tab Row */}
                <div className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Reorder controls & Index */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="w-6 text-center text-xs font-bold text-neutral-400">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveTabUp(index)}
                        disabled={index === 0}
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 cursor-pointer rounded hover:bg-neutral-100"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTabDown(index)}
                        disabled={index === navLinks.length - 1}
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 cursor-pointer rounded hover:bg-neutral-100"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Tab Label, Path, and Badge Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                        Tab Name
                      </label>
                      <input
                        type="text"
                        value={tab.label}
                        onChange={(e) => handleTabChange(index, 'label', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                        Link URL / Path
                      </label>
                      <input
                        type="text"
                        value={tab.path}
                        onChange={(e) => handleTabChange(index, 'path', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono text-neutral-700 border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                        Badge Text <span className="font-normal text-neutral-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={tab.badge || ''}
                        onChange={(e) => handleTabChange(index, 'badge', e.target.value.toUpperCase())}
                        placeholder="e.g. NEW"
                        className="w-full px-2.5 py-1.5 text-xs uppercase font-bold text-[#5A1827] border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Actions: Dropdown Toggle, Active Status, Delete */}
                  <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    {/* Dropdown Menu Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleDropdownExpand(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        childCount > 0
                          ? 'bg-[#FBF1F3] text-[#5A1827] border-[#E8DCCF] hover:bg-[#F8E5E9]'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span>Dropdown ({childCount})</span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(index)}
                      className={`p-1.5 rounded text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                        tab.active !== false
                          ? 'text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-neutral-500 border-neutral-300 bg-neutral-100 hover:bg-neutral-200'
                      }`}
                      title={tab.active !== false ? 'Tab is Visible on Storefront' : 'Tab is Hidden'}
                    >
                      {tab.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="text-[11px] font-semibold hidden sm:inline">
                        {tab.active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </button>

                    {/* Delete Tab */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTab(index)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded transition-colors cursor-pointer"
                      title="Remove tab"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* EXPANDABLE DROPDOWN SUB-LINKS MANAGER */}
                {/* ========================================================= */}
                {isExpanded && (
                  <div className="bg-neutral-50/90 border-t border-neutral-200 p-4 sm:p-5 pl-8 sm:pl-12 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-2.5">
                      <div>
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                          <FolderPlus className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Dropdown Sub-Links for "{tab.label}"</span>
                        </h3>
                        <p className="text-[11px] text-neutral-500">
                          These links appear in the hover menu under "{tab.label}" on desktop and nested inside mobile drawer.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAddDropdownItem(index)}
                          className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Dropdown Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Preset Subcategories if available */}
                    {presetSuggestions.length > 0 && (
                      <div className="bg-white p-2.5 rounded border border-neutral-200 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                          Suggested Subcategories:
                        </span>
                        {presetSuggestions.map((preset) => {
                          const alreadyAdded = (tab.children || []).some((c) => c.label === preset.label || c.path === preset.path);
                          if (alreadyAdded) return null;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handlePopulatePresets(index, [preset])}
                              className="px-2 py-0.5 text-[11px] font-medium bg-neutral-100 hover:bg-[#FBF1F3] hover:text-[#5A1827] text-neutral-700 rounded border border-neutral-200 transition-colors cursor-pointer"
                            >
                              + {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Sub-links List */}
                    {childCount === 0 ? (
                      <div className="text-center py-6 bg-white rounded border border-dashed border-neutral-300 space-y-2">
                        <p className="text-xs text-neutral-500">
                          No dropdown sub-links yet for this tab.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddDropdownItem(index)}
                          className="px-3 py-1 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300 transition-colors cursor-pointer"
                        >
                          + Add First Dropdown Link
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tab.children.map((sub, cIdx) => (
                          <div
                            key={sub.id || cIdx}
                            className="bg-white p-2.5 rounded border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-neutral-400 w-5 text-center">
                                {cIdx + 1}.
                              </span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => handleMoveDropdownItemUp(index, cIdx)}
                                  disabled={cIdx === 0}
                                  className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDropdownItemDown(index, cIdx)}
                                  disabled={cIdx === childCount - 1}
                                  className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                              <div>
                                <input
                                  type="text"
                                  value={sub.label}
                                  onChange={(e) => handleDropdownItemChange(index, cIdx, 'label', e.target.value)}
                                  placeholder="Dropdown Item Label"
                                  className="w-full px-2 py-1 text-xs font-medium border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={sub.path}
                                  onChange={(e) => handleDropdownItemChange(index, cIdx, 'path', e.target.value)}
                                  placeholder="Item Link Destination Path"
                                  className="w-full px-2 py-1 text-xs font-mono text-neutral-600 border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteDropdownItem(index, cIdx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title="Delete dropdown item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminNavigation;
