import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';

export function SizeGuidePage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('size_guide');
  const brand = getBrand();

  const [activeTab, setActiveTab] = useState('suits');
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  const suitsChart = page.suits_chart || [];
  const juttisChart = page.juttis_chart || [];
  const howToMeasure = page.how_to_measure || [];

  // Convert inch to cm helper (1 inch = 2.54 cm)
  const formatVal = (inchVal) => {
    if (!inchVal) return '-';
    if (unit === 'in') return `${inchVal}"`;
    const num = parseFloat(inchVal);
    if (isNaN(num)) return inchVal;
    return `${Math.round(num * 2.54)} cm`;
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Size Guide & Measurements'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Comprehensive size charts and measurement guidelines for OCT9 suits, kurtas, sarees, and juttis.'}
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            {page.badge || 'Sizing & Tailoring'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            {page.title || 'Size Guide & Measurements'}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
            {page.subtitle || 'Standard sizing charts in inches and centimeters for our ethnic collections.'}
          </p>
        </div>

        {/* Tab Selection & Unit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('suits')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'suits'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Suits &amp; Kurtas
            </button>
            <button
              onClick={() => setActiveTab('juttis')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'juttis'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Footwear &amp; Juttis
            </button>
          </div>

          {activeTab === 'suits' && (
            <div className="flex items-center space-x-2 text-xs text-neutral-500">
              <span>Unit:</span>
              <button
                onClick={() => setUnit('in')}
                className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
                  unit === 'in' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300'
                }`}
              >
                Inches (")
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
                  unit === 'cm' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          )}
        </div>

        {/* Chart View */}
        {activeTab === 'suits' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-neutral-900 font-semibold">
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Bust</th>
                  <th className="py-3 px-3">Waist</th>
                  <th className="py-3 px-3">Hip</th>
                  <th className="py-3 px-3">Kurta Length</th>
                  <th className="py-3 px-3">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {suitsChart.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{row.size}</td>
                    <td className="py-3 px-3 text-neutral-700">{formatVal(row.bust)}</td>
                    <td className="py-3 px-3 text-neutral-700">{formatVal(row.waist)}</td>
                    <td className="py-3 px-3 text-neutral-700">{formatVal(row.hip)}</td>
                    <td className="py-3 px-3 text-neutral-700">{formatVal(row.length)}</td>
                    <td className="py-3 px-3 text-neutral-700">{formatVal(row.shoulder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'juttis' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-neutral-900 font-semibold">
                  <th className="py-3 px-3">IND / UK Size</th>
                  <th className="py-3 px-3">EU Size</th>
                  <th className="py-3 px-3">US Size</th>
                  <th className="py-3 px-3">Foot Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {juttisChart.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{row.ind_uk}</td>
                    <td className="py-3 px-3 text-neutral-700">{row.eu}</td>
                    <td className="py-3 px-3 text-neutral-700">{row.us}</td>
                    <td className="py-3 px-3 text-neutral-700">{row.foot_length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* How to Measure Guidelines */}
        <div className="space-y-6 pt-6 border-t border-neutral-200">
          <h2 className="font-serif text-xl font-bold text-neutral-900">How to Measure</h2>

          <div className="space-y-4">
            {howToMeasure.map((m, idx) => (
              <div key={idx} className="space-y-1 pb-3 border-b border-neutral-100 last:border-0">
                <span className="font-semibold text-sm text-neutral-900 block">{m.title}</span>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Tailoring Context Callout */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <strong className="text-neutral-900 font-semibold block sm:inline mr-2">Need custom tailoring or alterations?</strong>
            <span className="text-neutral-600">
              {page.tailoring_info || 'We offer alterations for sleeve length and minor fit adjustments.'}
            </span>
          </div>
          <Link
            to="/contact"
            className="font-bold text-brand-maroon hover:underline whitespace-nowrap"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
