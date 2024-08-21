const baseConfig = require('@extension/tailwindcss-config');
const { withUI } = require('@extension/ui');

/** @type {import('tailwindcss').Config} */
module.exports = withUI({
  ...baseConfig,
  darkMode: 'class', // Enable dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'logo-stroke-start': 'var(--logo-stroke-start)',
        'logo-stroke-middle': 'var(--logo-stroke-middle)',
        'logo-stroke-end': 'var(--logo-stroke-end)',
        'logo-fill-start': 'var(--logo-fill-start)',
        'logo-fill-middle': 'var(--logo-fill-middle)',
        'logo-fill-end': 'var(--logo-fill-end)',
        orange: '#ff6b35',
      },
    },
  },
  plugins: [],
});
