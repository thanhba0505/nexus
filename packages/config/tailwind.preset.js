/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        launchpad: {
          bg: 'rgba(10, 15, 30, 0.45)',
          dock: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.15)',
          hover: 'rgba(255, 255, 255, 0.18)',
        },
      },
      borderRadius: {
        squircle: '22px',
        dock: '24px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif',
        ],
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '60px',
      },
      boxShadow: {
        squircle: '0 8px 24px -4px rgba(0, 0, 0, 0.35)',
        'squircle-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.45)',
        dock: '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
