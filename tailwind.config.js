/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#141414',
          charcoal: '#1C1C1C',
          gold: '#C5A880',
          'gold-light': '#E2CEB4',
          'gold-dark': '#A38459',
          maroon: '#5A1827',
          'maroon-hover': '#430F1B',
          'maroon-light': '#7A2437',
          cream: '#FAF7F2',
          'cream-warm': '#F3ECE1',
          sand: '#ECE4D8',
          border: '#E7DFD5',
        }
      },
      fontFamily: {
        serif: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(20, 20, 20, 0.08), 0 4px 6px -2px rgba(20, 20, 20, 0.03)',
        'luxury-hover': '0 20px 35px -5px rgba(90, 24, 39, 0.12), 0 8px 10px -4px rgba(20, 20, 20, 0.04)',
        'gold': '0 4px 20px rgba(197, 168, 128, 0.25)',
      }
    },
  },
  plugins: [],
}
