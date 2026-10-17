import preset from '@nexus/config/tailwind.preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        accent: {
          DEFAULT: '#00c49a',
          50: '#ecfdf8',
          100: '#d1faee',
          200: '#a7f3df',
          300: '#6ee7ca',
          400: '#2fd1b2',
          500: '#00c49a',
          600: '#00a380',
          700: '#008066',
          800: '#046552',
          900: '#085344',
          950: '#002f26',
        },
        pet: {
          canvas: '#031411',
          header: '#051b17',
          footer: '#041814',
          surface1: '#061c18',
          surface2: '#082620',
          surface3: '#0e3d34',
          hover: '#0c332b',
          border: 'rgba(0, 196, 154, 0.2)',
          'border-hover': 'rgba(0, 196, 154, 0.4)',
        },
      },
    },
  },
  plugins: [],
};
