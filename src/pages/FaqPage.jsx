import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useContent } from '../context/ContentContext.jsx';

export function FaqPage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('faq');
  const brand = getBrand();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = page.categories || [];

  // Filter categories and items
  const filteredCategories = categories.map((cat) => {
    const matchingItems = (cat.items || []).filter((item) => {
      const qMatch = item.question?.toLowerCase().includes(search.toLowerCase());
      const aMatch = item.answer?.toLowerCase().includes(search.toLowerCase());
      return qMatch || aMatch;
    });
    return { ...cat, items: matchingItems };
  }).filter((cat) => {
    if (activeCategory !== 'All' && cat.name !== activeCategory) return false;
    return cat.items && cat.items.length > 0;
  });

  const toggleAccordion = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Frequently Asked Questions'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Find answers to common questions about orders, payments, shipping, sizing, and returns at OCT9.'}
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            {page.badge || 'Help & Support'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            {page.title || 'Frequently Asked Questions'}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
            {page.subtitle || 'Find fast answers to common questions about shopping, sizing, shipping, and returns at OCT9.'}
          </p>

          {/* Search Bar */}
          <div className="pt-3 max-w-md relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-1.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword (e.g. shipping, returns, sizing)..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-6 overflow-x-auto border-b border-neutral-200 pb-3">
          <button
            onClick={() => setActiveCategory('All')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'All'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            All Questions
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat.name)}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.name
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Accordion List (Clean editorial divider rows) */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center space-y-2 border-b border-neutral-200">
              <h3 className="font-semibold text-sm text-neutral-900">No matching questions found</h3>
              <p className="text-xs text-neutral-500">
                Need more help? Our customer support team is always available.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="text-xs font-bold text-brand-maroon underline hover:text-brand-maroon-hover"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          ) : (
            filteredCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h2 className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                  {cat.name}
                </h2>

                <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {(cat.items || []).map((item, itemIdx) => {
                    const isOpen = openIndex === `${catIdx}-${itemIdx}`;
                    return (
                      <div key={itemIdx}>
                        <button
                          type="button"
                          onClick={() => toggleAccordion(catIdx, itemIdx)}
                          className="w-full text-left py-4 flex items-center justify-between space-x-3 cursor-pointer hover:text-brand-maroon transition-colors"
                        >
                          <span className="font-semibold text-sm text-neutral-900">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                              isOpen ? 'transform rotate-180 text-neutral-900' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="pb-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Footer */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>Still have a question? Our support team is here to assist.</span>
          <Link to="/contact" className="font-semibold text-brand-maroon hover:underline">
            Contact Customer Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
