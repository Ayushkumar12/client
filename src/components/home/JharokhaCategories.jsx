import React from 'react';
import { Link } from 'react-router-dom';

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

const CATEGORIES = [
  {
    id: 'zewar',
    name: 'Zewar',
    slug: 'accessories',
    link: '/category/accessories',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85',
    isBrandCard: true,
    brandText: 'Zewar',
    brandSub: 'by label OCT9'
  },
  {
    id: 'sharara-set',
    name: 'Sharara Set',
    slug: 'suits',
    link: '/category/suits?sub_category=Sharara+Suit',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85'
  },
  {
    id: 'farshi-salwaar',
    name: 'Farshi Salwaar Set',
    slug: 'suits',
    link: '/category/suits?sub_category=Punjabi+Suit',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85'
  },
  {
    id: 'a-line',
    name: 'A Line Set',
    slug: 'suits',
    link: '/category/suits?sub_category=Straight+Suit',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85'
  },
  {
    id: 'straight-fit',
    name: 'Straight Fit',
    slug: 'designer-suits',
    link: '/category/designer-suits',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85'
  },
  {
    id: 'anarkali-set',
    name: 'Anarkali Set',
    slug: 'festive-wear',
    link: '/category/festive-wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'
  },
  {
    id: 'sarees',
    name: 'Designer Sarees',
    slug: 'sarees',
    link: '/category/sarees',
    image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=600&q=85'
  }
];

export function JharokhaCategories() {
  return (
    <section className="relative py-10 sm:py-14 bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#FDFBF7] border-y border-[#EFE8DD] overflow-hidden">
      {/* Background Decorative Floral / Damask Subtle Ambient Texture */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(139,94,60,0.12) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle section header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-brand-maroon uppercase">
            Curated Silhouettes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mt-1">
            Shop by Silhouette
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-2" />
        </div>

        {/* Categories Row / Grid matching screenshot exactly */}
        <div className="flex items-center justify-start lg:justify-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 pt-2 no-scrollbar px-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="group flex flex-col items-center space-y-3 shrink-0 focus:outline-none transition-transform duration-300 hover:-translate-y-1.5"
            >
              {/* Jharokha SVG Frame Card with Double Border */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:drop-shadow-[0_12px_24px_rgba(90,24,39,0.15)] transition-all duration-300">
                <svg
                  viewBox="0 0 160 160"
                  className="w-full h-full transform transition-transform duration-500 group-hover:scale-[1.03]"
                >
                  <defs>
                    <clipPath id={`jharokha-clip-${cat.id}`}>
                      <path d={JHAROKHA_INNER_PATH} />
                    </clipPath>
                  </defs>

                  {/* Outer Background Layer (Cream/Ivory Fill) */}
                  <path
                    d={JHAROKHA_PATH}
                    fill="#FAF7F2"
                    stroke="#8C6339"
                    strokeWidth="1.2"
                    strokeOpacity="0.75"
                  />

                  {/* Outer Fine Double Line Trim */}
                  <path
                    d={JHAROKHA_PATH}
                    fill="none"
                    stroke="#D4B68A"
                    strokeWidth="0.8"
                    strokeDasharray="3 1.5"
                    transform="scale(0.96) translate(3.2, 3.2)"
                    opacity="0.9"
                  />

                  {/* Inner Clipped Image / Brand Card */}
                  <g clipPath={`url(#jharokha-clip-${cat.id})`}>
                    <image
                      href={cat.image}
                      x="0"
                      y="0"
                      width="160"
                      height="160"
                      preserveAspectRatio="xMidYMid slice"
                      className="transition-transform duration-700 ease-out group-hover:scale-115 origin-center"
                    />

                    {/* If Brand Card (like Zewar in screenshot) show elegant overlay */}
                    {cat.isBrandCard && (
                      <g>
                        <rect width="160" height="160" fill="#FAF5ED" fillOpacity="0.88" />
                        <text
                          x="80"
                          y="78"
                          textAnchor="middle"
                          fill="#5A1827"
                          fontFamily="'Playfair Display', Georgia, serif"
                          fontSize="21"
                          fontWeight="bold"
                          letterSpacing="0.5"
                        >
                          {cat.brandText}
                        </text>
                        <text
                          x="80"
                          y="94"
                          textAnchor="middle"
                          fill="#8C6339"
                          fontFamily="sans-serif"
                          fontSize="7"
                          fontStyle="italic"
                          letterSpacing="1"
                        >
                          {cat.brandSub}
                        </text>
                      </g>
                    )}

                    {/* Subtle warm lighting vignette */}
                    <path
                      d={JHAROKHA_INNER_PATH}
                      fill="none"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Inner Fine Gold Border Line */}
                  <path
                    d={JHAROKHA_INNER_PATH}
                    fill="none"
                    stroke="#A87B4F"
                    strokeWidth="1.2"
                    className="transition-colors duration-300 group-hover:stroke-[#5A1827]"
                  />
                </svg>
              </div>

              {/* Category Name Label */}
              <div className="text-center px-1">
                <span className="font-serif sm:font-sans text-xs sm:text-sm font-semibold tracking-wide text-neutral-800 group-hover:text-brand-maroon transition-colors block">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
