import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';

// 4-Pointed Royal Mughal Jharokha Arch / Medallion Path (Outer Outline)
// Coordinates calibrated on 200 x 210 viewBox
const JHAROKHA_OUTER_PATH = `
  M 100 6
  C 100 24, 118 28, 134 28
  C 162 28, 180 50, 180 76
  C 180 92, 186 100, 196 105
  C 186 110, 180 118, 180 134
  C 180 160, 162 182, 134 182
  C 118 182, 100 186, 100 204
  C 100 186, 82 182, 66 182
  C 38 182, 20 160, 20 134
  C 20 118, 14 110, 4 105
  C 14 100, 20 92, 20 76
  C 20 50, 38 28, 66 28
  C 82 28, 100 24, 100 6
  Z
`.replace(/\s+/g, ' ').trim();

// Inner Inset Path for Double Gold Border & Exact Image Mask
const JHAROKHA_INNER_PATH = `
  M 100 14
  C 100 28, 116 34, 130 34
  C 154 34, 170 54, 170 76
  C 170 90, 176 99, 185 105
  C 176 111, 170 120, 170 134
  C 170 156, 154 176, 130 176
  C 116 176, 100 182, 100 196
  C 100 182, 84 176, 70 176
  C 46 176, 30 156, 30 134
  C 30 120, 24 111, 15 105
  C 24 99, 30 90, 30 76
  C 30 54, 46 34, 70 34
  C 84 34, 100 28, 100 14
  Z
`.replace(/\s+/g, ' ').trim();

export function JharokhaCategories() {
  const { getJharokhaCategories } = useContent();
  const categories = getJharokhaCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="relative w-full py-6 sm:py-8 md:py-10 bg-gradient-to-b from-[#FAF7F2] via-[#FDFBF7] to-[#FAF7F2] border-y border-[#EFE8DC] overflow-hidden">
      {/* Background Subtle Luxury Texture Watermark */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(#5A1827 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Full-Width Edge-to-Edge Container */}
      <div className="relative w-full px-3 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        {/* Full-width responsive flex container */}
        <div className="flex items-center justify-start lg:justify-center xl:justify-between gap-3 sm:gap-5 md:gap-6 lg:gap-5 xl:gap-6 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
          {categories.map((cat, idx) => {
            const catId = cat.id || cat.slug || `category-${idx}`;
            const clipId = `jharokha-clip-${catId}`;

            return (
              <Link
                key={catId}
                to={cat.link || `/category/${cat.slug}`}
                className="group flex flex-col items-center flex-shrink-0 lg:flex-1 min-w-[105px] sm:min-w-[125px] md:min-w-[140px] lg:min-w-[145px] max-w-[185px] focus:outline-none transition-transform duration-300 hover:-translate-y-1.5"
                aria-label={cat.name}
              >
                {/* Royal Jharokha SVG Frame */}
                <div className="relative w-24 h-26 sm:w-28 sm:h-30 md:w-32 md:h-34 lg:w-36 lg:h-38 xl:w-40 xl:h-42 filter drop-shadow-[0_4px_12px_rgba(184,147,88,0.18)] group-hover:drop-shadow-[0_10px_24px_rgba(184,147,88,0.4)] transition-all duration-500 ease-out">
                  <svg
                    viewBox="0 0 200 210"
                    className="w-full h-full overflow-visible"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      {/* Mask for the Inner Image */}
                      <clipPath id={clipId}>
                        <path d={JHAROKHA_INNER_PATH} />
                      </clipPath>
                    </defs>

                    {/* Outer Solid Fill Behind Image */}
                    <path
                      d={JHAROKHA_OUTER_PATH}
                      fill="#FFFFFF"
                    />

                    {/* Masked Category Image */}
                    <g clipPath={`url(#${clipId})`}>
                      <image
                        href={cat.image}
                        x="0"
                        y="0"
                        width="200"
                        height="210"
                        preserveAspectRatio="xMidYMid slice"
                        className="transition-transform duration-700 ease-out origin-center group-hover:scale-110"
                      />
                      {/* Subtle Warm Amber Gradient Overlay */}
                      <rect
                        x="0"
                        y="0"
                        width="200"
                        height="210"
                        fill="rgba(90, 24, 39, 0.04)"
                        className="group-hover:fill-transparent transition-colors duration-300"
                      />
                    </g>

                    {/* Outer Gold Contour Stroke */}
                    <path
                      d={JHAROKHA_OUTER_PATH}
                      fill="none"
                      stroke="#C5A880"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[#936829] transition-colors duration-300"
                    />

                    {/* Inner Fine Gold Hairline Stroke */}
                    <path
                      d={JHAROKHA_INNER_PATH}
                      fill="none"
                      stroke="#B89358"
                      strokeWidth="1"
                      strokeOpacity="0.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[#5A1827] group-hover:stroke-opacity-60 transition-all duration-300"
                    />
                  </svg>
                </div>

                {/* Category Title Label */}
                <div className="mt-2.5 sm:mt-3 text-center px-0.5 w-full">
                  <span className="text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-semibold tracking-wide text-neutral-800 group-hover:text-brand-maroon transition-colors duration-200 block whitespace-nowrap text-ellipsis overflow-hidden">
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

export default JharokhaCategories;


