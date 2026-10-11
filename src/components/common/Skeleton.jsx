import React from 'react';

/**
 * Basic Skeleton placeholder component with pulse & subtle shimmer
 */
export function Skeleton({ className = '', rounded = 'rounded', ...props }) {
  return (
    <div
      className={`bg-neutral-200/80 animate-pulse skeleton-shimmer ${rounded} ${className}`}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton
 * Matches the editorial luxury e-commerce product card layout (as shown in user specification):
 * - Outer card border & padding
 * - Large image container with subtle rounded corners
 * - Title placeholder bar
 * - Subtitle / price placeholder bar
 */
export function ProductCardSkeleton({ className = '' }) {
  return (
    <div
      className={`relative bg-white rounded-sm overflow-hidden border border-neutral-200/90 shadow-2xs flex flex-col justify-between p-2 sm:p-3 transition-all ${className}`}
    >
      {/* Product Image Placeholder */}
      <div className="relative aspect-[3/3.8] w-full rounded-md bg-neutral-200/80 skeleton-shimmer overflow-hidden">
        {/* Subtle top-left badge notch placeholder */}
        <div className="absolute top-0 left-0 bg-white/70 w-16 h-4 rounded-br-sm" />
      </div>

      {/* Product Details Lines */}
      <div className="pt-3 px-0.5 pb-1 space-y-2">
        {/* Title Bar (65% - 75% width) */}
        <div className="h-3.5 bg-neutral-200/80 rounded-full w-3/4 skeleton-shimmer" />

        {/* Price / Subtitle Bar (40% - 50% width) */}
        <div className="h-3 bg-neutral-200/80 rounded-full w-1/2 skeleton-shimmer" />
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton
 * Renders multiple ProductCardSkeleton items in a responsive grid
 */
export function ProductGridSkeleton({ count = 6, columns = 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3', className = '' }) {
  return (
    <div className={`grid ${columns} gap-3 sm:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Product Detail Page Skeleton
 * Matches luxury fashion PDP layout (Gallery on left, product details on right)
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-3 bg-neutral-200/80 rounded-full w-12 skeleton-shimmer" />
          <span className="text-neutral-300">/</span>
          <div className="h-3 bg-neutral-200/80 rounded-full w-20 skeleton-shimmer" />
          <span className="text-neutral-300">/</span>
          <div className="h-3 bg-neutral-200/80 rounded-full w-36 skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Gallery Skeleton (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-hidden shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-20 sm:w-20 sm:h-26 rounded-md bg-neutral-200/80 skeleton-shimmer shrink-0"
                />
              ))}
            </div>

            {/* Main Featured Image */}
            <div className="flex-1 aspect-[3/4] rounded-md bg-neutral-200/80 skeleton-shimmer overflow-hidden border border-neutral-200" />
          </div>

          {/* Right Details Column Skeleton (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Tag & Rating */}
            <div className="space-y-2">
              <div className="h-3 bg-neutral-200/80 rounded-full w-24 skeleton-shimmer" />
              {/* Product Title (2 lines) */}
              <div className="h-6 bg-neutral-200/80 rounded-sm w-5/6 skeleton-shimmer" />
              <div className="h-6 bg-neutral-200/80 rounded-sm w-3/5 skeleton-shimmer" />
            </div>

            {/* Price Row */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="h-7 bg-neutral-200/80 rounded-sm w-28 skeleton-shimmer" />
              <div className="h-4 bg-neutral-200/80 rounded-sm w-16 skeleton-shimmer" />
              <div className="h-5 bg-neutral-200/80 rounded-full w-14 skeleton-shimmer" />
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-neutral-200/80" />

            {/* Size Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="h-3 bg-neutral-200/80 rounded-full w-20 skeleton-shimmer" />
              <div className="flex gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                  <div key={s} className="w-11 h-9 rounded-md bg-neutral-200/80 skeleton-shimmer" />
                ))}
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="h-12 bg-neutral-200/80 rounded-md w-full skeleton-shimmer" />
              <div className="h-12 bg-neutral-200/80 rounded-md w-full skeleton-shimmer" />
            </div>

            {/* Pincode / Shipping Checker Box */}
            <div className="p-4 bg-white rounded-md border border-neutral-200 space-y-2.5">
              <div className="h-3 bg-neutral-200/80 rounded-full w-32 skeleton-shimmer" />
              <div className="h-9 bg-neutral-200/80 rounded-md w-full skeleton-shimmer" />
            </div>

            {/* Details Accordion Blocks */}
            <div className="space-y-2 pt-2">
              <div className="h-10 bg-white rounded-md border border-neutral-200 skeleton-shimmer" />
              <div className="h-10 bg-white rounded-md border border-neutral-200 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enterprise Table Skeleton
 * Used in Admin Panel (Products, Orders, Inventory, Customers)
 */
export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-sm overflow-hidden">
      {/* Table Header */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 grid grid-cols-12 gap-4">
        {Array.from({ length: columns }).map((_, idx) => (
          <div
            key={idx}
            className={`h-3 bg-neutral-200/80 rounded-full skeleton-shimmer ${
              idx === 0 ? 'col-span-4' : idx === 1 ? 'col-span-3' : 'col-span-2'
            }`}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3.5 grid grid-cols-12 gap-4 items-center">
            {/* Col 1: Avatar or Title */}
            <div className="col-span-4 flex items-center space-x-3">
              <div className="w-9 h-11 bg-neutral-200/80 rounded skeleton-shimmer shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3 bg-neutral-200/80 rounded-full w-4/5 skeleton-shimmer" />
                <div className="h-2.5 bg-neutral-200/80 rounded-full w-2/5 skeleton-shimmer" />
              </div>
            </div>

            {/* Col 2 */}
            <div className="col-span-3 space-y-1">
              <div className="h-3 bg-neutral-200/80 rounded-full w-3/4 skeleton-shimmer" />
              <div className="h-2.5 bg-neutral-200/80 rounded-full w-1/2 skeleton-shimmer" />
            </div>

            {/* Col 3 */}
            <div className="col-span-2">
              <div className="h-3 bg-neutral-200/80 rounded-full w-2/3 skeleton-shimmer" />
            </div>

            {/* Col 4 */}
            <div className="col-span-2">
              <div className="h-5 bg-neutral-200/80 rounded-full w-16 skeleton-shimmer" />
            </div>

            {/* Col 5: Actions */}
            <div className="col-span-1 flex justify-end">
              <div className="h-4 bg-neutral-200/80 rounded w-8 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Order History Card Skeleton
 * Used in OrdersPage.jsx
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden p-4 sm:p-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="h-3.5 bg-neutral-200/80 rounded-full w-32 skeleton-shimmer" />
          <div className="h-3 bg-neutral-200/80 rounded-full w-24 skeleton-shimmer" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-6 bg-neutral-200/80 rounded-full w-20 skeleton-shimmer" />
          <div className="h-4 bg-neutral-200/80 rounded-full w-16 skeleton-shimmer" />
        </div>
      </div>

      {/* Item Details Row */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-20 bg-neutral-200/80 rounded-md skeleton-shimmer shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-neutral-200/80 rounded-full w-2/3 skeleton-shimmer" />
          <div className="h-3 bg-neutral-200/80 rounded-full w-1/3 skeleton-shimmer" />
          <div className="h-3.5 bg-neutral-200/80 rounded-full w-1/4 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
