/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'var(--app-border, rgba(var(--app-tone-3-rgb, 99, 102, 241), 0.25))',
      },
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        launchpad: {
          bg: 'rgba(10, 15, 30, 0.45)',
          dock: 'rgba(var(--app-tone-3-rgb, 99, 102, 241), 0.12)',
          border: 'var(--app-border, rgba(var(--app-tone-3-rgb, 99, 102, 241), 0.25))',
          hover: 'rgba(var(--app-tone-3-rgb, 99, 102, 241), 0.18)',
        },
        // Semantic Dynamic Tokens mapping to current theme CSS Variables
        app: {
          'tone-1': 'var(--app-tone-1)',
          'tone-2': 'var(--app-tone-2)',
          'tone-3': 'var(--app-tone-3)',
          'tone-4': 'var(--app-tone-4)',
          'tone-5': 'var(--app-tone-5)',
          glow: 'var(--app-glow)',
        },
        // Specific 5-Tone Ecosystem Palettes
        nexus: {
          'tone-1': '#e0e7ff',
          'tone-2': '#a5b4fc',
          'tone-3': '#6366f1',
          'tone-4': '#131238',
          'tone-5': '#070714',
        },
        github: {
          'tone-1': '#e0f2fe',
          'tone-2': '#7dd3fc',
          'tone-3': '#0ea5e9',
          'tone-4': '#061c2b',
          'tone-5': '#030d17',
        },
        slackbot: {
          'tone-1': '#ede9fe',
          'tone-2': '#c4b5fd',
          'tone-3': '#8b5cf6',
          'tone-4': '#1b0a3c',
          'tone-5': '#090514',
        },
        pet: {
          'tone-1': '#f0fdf9',
          'tone-2': '#5eead4',
          'tone-3': '#00c49a',
          'tone-4': '#082620',
          'tone-5': '#031411',
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
        dock: '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(var(--app-tone-3-rgb, 99, 102, 241), 0.25)',
      },
      keyframes: {
        'menu-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
      animation: {
        'menu-in': 'menu-in 120ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 100ms ease-out forwards',
        indeterminate: 'indeterminate 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
