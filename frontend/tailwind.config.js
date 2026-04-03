/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        brand: '#E8A020',
        dark: '#0D0E0F',
        surface: '#161819',
        surface2: '#1E2022',
        surface3: '#262A2D',
      },
    },
  },
  plugins: [],
};
