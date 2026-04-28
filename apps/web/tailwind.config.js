/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#bed0ff',
          300: '#91afff',
          400: '#6088ff',
          500: '#3b63f7',
          600: '#2346ec',
          700: '#1b35d8',
          800: '#1d2eaf',
          900: '#1e2c8a',
          950: '#161c5a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
