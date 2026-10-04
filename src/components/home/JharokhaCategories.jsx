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
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85'
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
    <section className="relative w-full py-2 sm:py-4 overflow-hidden">
      <div className="w-full px-[10px]">
        {/* Categories Row - Full width with 10px margin, no text */}
        <div className="flex items-center justify-between sm:justify-center gap-2.5 sm:gap-4 md:gap-6 overflow-x-auto py-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="group shrink-0 focus:outline-none transition-transform duration-300 hover:-translate-y-1.5"
              aria-label={cat.name}
            >
              {/* Jharokha SVG Frame Card with Double Border */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.07)] group-hover:drop-shadow-[0_10px_22px_rgba(90,24,39,0.16)] transition-all duration-300">
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

                  {/* Inner Clipped Image */}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
