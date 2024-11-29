/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002a88',
          50: '#e6eaf4',
          100: '#ccd5e9',
          200: '#99abd3',
          300: '#6682bd',
          400: '#3358a7',
          500: '#002a88',
          600: '#00226d',
          700: '#001952',
          800: '#001136',
          900: '#00081b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};