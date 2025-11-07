/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#7FB7FF',
          active: '#9DC8FF',
          dark: '#6B9FD9',
          translucent: 'rgba(127, 183, 255, 0.2)',
        },
        dark: {
          bg: '#0D0F11',
          card: '#14171A',
          surface: '#1A1D21',
          border: '#2C3138',
          modal: '#1A1D21',
          'text-primary': '#F5F8FA',
          'text-secondary': '#AAB8C2',
          'text-tertiary': '#657786',
        },
        light: {
          bg: '#F0F2F5',
          card: '#FFFFFF',
          surface: '#E6E8EB',
          border: '#D1D5DB',
          'text-primary': '#14171A',
          'text-secondary': '#657786',
          'text-tertiary': '#AAB8C2',
        },
        danger: {
          DEFAULT: '#E0245E',
          dark: '#C71F52',
        },
        info: '#1DA1F2',
        'fab-bg': 'rgba(26, 29, 33, 0.8)',
        macro: {
            carbs: '#FBBF24',
            fat: '#F87171',
        }
      },
      borderRadius: {
        'radius-std': '24px',
        'radius-input': '16px',
        'radius-btn': '18px',
        'radius-lg': '28px',
        'radius-modal': '32px',
      },
      boxShadow: {
        'elevation-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevation-lg': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        posterFadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        fadeScaleIn: {
            '0%': { opacity: 0, transform: 'translateY(100%) scale(0.9)' },
            '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        breathingGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(127, 183, 255, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(127, 183, 255, 0.5))' },
        },
        iconPopIn: {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        dotBounce: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1.0)' },
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        posterFadeInUp: 'posterFadeInUp 0.4s ease-out forwards',
        fadeScaleIn: 'fadeScaleIn 0.4s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
        'breathing-glow': 'breathingGlow 3s ease-in-out infinite',
        iconPopIn: 'iconPopIn 0.3s ease-out',
        'dot-bounce': 'dotBounce 1.2s infinite ease-in-out',
      },
      letterSpacing: {
        display: '-0.025em',
        title: '-0.015em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'micro': '150ms',
        'fast': '220ms',
        'base': '300ms',
      },
    },
  },
  plugins: [],
};
