/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // or 'class' for manual dark mode toggle
  theme: {
    extend: {
      colors: {
        'line-green': '#06C755',
        'line-light-green': '#00B900',
      },
      boxShadow: {
        'app': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'app': '8px',
      },
    },
    fontFamily: {
      sans: [
        'Helvetica Neue',
        'Arial',
        'Hiragino Kaku Gothic ProN',
        'Hiragino Sans',
        'Meiryo',
        'Hiragino Sans',
      ],
    }
  },
  plugins: [],
} 