import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';

// Exact 4-Point Royal Mughal Jharokha Arch SVG Path
const JHAROKHA_PATH = `
  M 80 4
  C 80 18, 92 22, 102 22
  C 122 22, 138 38, 138 58
  C 138 68, 142 80, 156 80
  C 142 80, 138 92, 138 102
  C 138 122, 122 138, 102 138
  C 92 138, 80 142, 80 156
  C 80 142, 68 138, 58 138
  C 38 138, 22 122, 22 102
  C 22 92, 18 80, 4 80
  C 18 80, 22 68, 22 58
  C 22 38, 38 22, 58 22
  C 68 22, 80 18, 80 4
  Z
`.replace(/\s+/g, ' ').trim();

// Slightly inset path for the inner image / double border frame
const JHAROKHA_INNER_PATH = `
  M 80 10
  C 80 22, 90 26, 99 26
  C 117 26, 132 41, 132 59
  C 132 68, 136 78, 148 80
  C 136 82, 132 92, 132 101
  C 132 119, 117 134, 99 134
  C 90 134, 80 138, 80 150
  C 80 138, 70 134, 61 134
  C 43 134, 28 119, 28 101
  C 28 92, 24 82, 12 80
  C 24 78, 28 68, 28 59
  C 28 41, 43 26, 61 26
  C 70 26, 80 22, 80 10
  Z
`.replace(/\s+/g, ' ').trim();

export function JharokhaCategories() {
  const { getJharokhaCategories } = useContent();
  const categories = getJharokhaCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="relative w-full py-4 bg-white border-b border-neutral-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Row - Clean modern horizontal avatar carousel */}
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto py-2 no-scrollbar">
          {categories.map((cat, idx) => {
            const catId = cat.id || cat.slug || `category-${idx}`;
            return (
              <Link
                key={catId}
                to={cat.link || `/category/${cat.slug}`}
                className="group flex flex-col items-center space-y-2 shrink-0 focus:outline-none"
                aria-label={cat.name}
              >
                {/* Modern circular thumbnail with clean border */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-neutral-200 group-hover:border-neutral-800 transition-all duration-300 shadow-xs group-hover:shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Category Name Label */}
                <div className="text-center px-1">
                  <span className="text-xs sm:text-sm font-medium text-neutral-700 group-hover:text-neutral-950 transition-colors block whitespace-nowrap">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
